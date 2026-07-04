import React, {
  useState, useRef, useEffect, useContext, useMemo, useCallback,
} from 'react';

import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Group,
  Arrow,
} from 'react-konva';

import AppContext from '../context/AppContext';

// Field Dimension
const KRI_FIELD = {
  name: 'KRI',
  dimensions: {
    length: 900,
    width: 600,
  },
  goal: {
    width: 260,
    depth: 60,
  },
  penaltyArea: {
    width: 500,
    length: 100,
  },
  penaltyPoint: {
    x: 210,
    y: 300,
  },
  kickoff: {
    circleRadius: 75,
    pointRadius: 8,
  },
  borderWidth: 5,
};

const ROBOCUP_FIELD = {
  name: 'ROBOCUP',
  dimensions: {
    length: 900,
    width: 600,
  },
  goal: {
    width: 180,
    depth: 60,
  },
  goalArea: {
    width: 300,
    length: 100,
  },
  penaltyArea: {
    width: 400,
    length: 200,
  },
  penaltyPoint: {
    x: 150,
    y: 300,
  },
  kickoff: {
    circleRadius: 75,
    pointRadius: 8,
  },
  borderWidth: 5,
};

// Object Dimension
const ROBOT_RADIUS = 20;
const BALL_RADIUS = 10;
const KICK_LINE_LENGTH = 500;

// Color
const FIELD_COLOR = '#00A000';
const LINE_COLOR = '#FFFFFF';
const ROBOT_COLOR = '#0088FF';
const BALL_COLOR = '#FF8800';
const KICK_LINE_COLOR = '#353E43';

function FieldMap() {
  const {
    robotPose, projectedObjects, particles, kickDirection, markers, fieldType
  } = useContext(AppContext);

  const selectedField = fieldType === 'kri' ? KRI_FIELD : ROBOCUP_FIELD;

  const fieldDimension = selectedField.dimensions;
  const goal = selectedField.goal;
  const penaltyArea = selectedField.penaltyArea;
  const penaltyPoint = selectedField.penaltyPoint;
  const kickoff = selectedField.kickoff;
  const borderWidth = selectedField.borderWidth;

  // Stage Dimension
  const stageDimension = {
    width: fieldDimension.length + 2 * goal.depth + 100,
    height: fieldDimension.width + 100,
  };

  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({
    width: stageDimension.width,
    height: stageDimension.height,
  });
  const [scale, setScale] = useState(1);
  const [cursor, setCursor] = useState(null);

  const mouseMoveThrottle = useRef(null);

  const offset = useMemo(() => ({
    x: (stageDimension.width - fieldDimension.length) / 2,
    y: (stageDimension.height - fieldDimension.width) / 2 + 20,
  }), [stageDimension.width, stageDimension.height, fieldDimension.length, fieldDimension.width]);

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const maxContainerHeight = window.innerHeight * 0.9;
      const aspectRatio = fieldDimension.length / fieldDimension.width;
      let calculatedHeight = containerWidth / aspectRatio;
      let finalWidth = containerWidth;

      if (calculatedHeight > maxContainerHeight) {
        calculatedHeight = maxContainerHeight;
        finalWidth = calculatedHeight * aspectRatio;
      }

      const scaleX = finalWidth / stageDimension.width;
      const scaleY = calculatedHeight / stageDimension.height;
      const finalScale = Math.min(scaleX, scaleY);

      setStageSize({
        width: finalWidth,
        height: calculatedHeight,
      });

      setScale(finalScale);
    }
  }, [fieldDimension.length, fieldDimension.width, stageDimension.width, stageDimension.height]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [fieldType, updateSize]);

  const fieldToStage = useCallback((x, y) => ({
    x: offset.x + x,
    y: offset.y + y,
  }), [offset]);

  const objectPosToField = useCallback((x, y) => {
    const cosTheta = Math.cos(robotPose.a);
    const sinTheta = Math.sin(robotPose.a);

    const fieldX = robotPose.x + x * cosTheta + y * sinTheta;
    const fieldY = robotPose.y + x * sinTheta - y * cosTheta;

    return {
      x: fieldX,
      y: fieldY,
    };
  }, [robotPose.a, robotPose.x, robotPose.y]);

  // Throttle mouse move
  const handleMouseMove = useCallback((e) => {
    if (mouseMoveThrottle.current) return;

    mouseMoveThrottle.current = setTimeout(() => {
      mouseMoveThrottle.current = null;
    }, 16);

    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    const realX = mousePos.x / scale - offset.x;
    const realY = mousePos.y / scale - offset.y;

    if (
      realX >= 0 &&
      realX <= fieldDimension.length &&
      realY >= 0 &&
      realY <= fieldDimension.width
    ) {
      setCursor({ x: realX.toFixed(1), y: realY.toFixed(1) });
    } else {
      setCursor(null);
    }
  }, [scale, offset.x, offset.y]);

  const robotElement = useMemo(() => {
    const pos = fieldToStage(robotPose.x, robotPose.y);
    const endX = robotPose.x + Math.cos(robotPose.a) * ROBOT_RADIUS;
    const endY = robotPose.y + Math.sin(robotPose.a) * ROBOT_RADIUS;
    const endPos = fieldToStage(endX, endY);

    const odoPos = fieldToStage(robotPose.x_odometry, robotPose.y_odometry);

    return (
      <>
        {/* Fused Robot Pose */}
        <Circle
          x={pos.x}
          y={pos.y}
          radius={ROBOT_RADIUS}
          fill={ROBOT_COLOR}
        />
        <Line
          points={[pos.x, pos.y, endPos.x, endPos.y]}
          stroke="black"
          strokeWidth={2}
        />

        {/* Odometry Robot */}
        <Circle
          x={odoPos.x}
          y={odoPos.y}
          radius={ROBOT_RADIUS}
          stroke="blue"
          strokeWidth={2}
          dash={[4, 4]}
        />

        {/* Error Line */}
        <Line
          points={[pos.x, pos.y, odoPos.x, odoPos.y]}
          stroke="red"
          strokeWidth={1}
          dash={[2, 2]}
        />
      </>
    );
  }, [
    robotPose.x,
    robotPose.y,
    robotPose.a,
    robotPose.x_odometry,
    robotPose.y_odometry,
    fieldToStage
  ]);

  const renderOtherRobot = useCallback(({ x, y }, color = 'gray') => {
    const radius = ROBOT_RADIUS * 0.9;

    return (
      <>
        {/* Outer Circle */}
        <Circle
          x={x}
          y={y}
          radius={radius}
          stroke={color}
          strokeWidth={2}
          dash={[4, 4]} // dashed
        />
      </>
    );
  }, []);

  const renderBall = useCallback(({ x, y }) => (
    <Circle x={x} y={y} radius={BALL_RADIUS} fill={BALL_COLOR} />
  ), []);

  const renderXIntersection = useCallback(({ x, y }, color = LINE_COLOR) => (
    <>
      <Line
        points={[x - kickoff.pointRadius, y, x + kickoff.pointRadius, y]}
        stroke={color}
        strokeWidth={borderWidth}
      />
      <Line
        points={[x, y - kickoff.pointRadius, x, y + kickoff.pointRadius]}
        stroke={color}
        strokeWidth={borderWidth}
      />
    </>
  ), []);

  const renderTIntersection = useCallback(({ x, y }, direction = 'up', color = LINE_COLOR) => {
    let rotation = 0;
    switch (direction) {
      case 'right':
        rotation = 0;
        break;
      case 'down':
        rotation = 90;
        break;
      case 'left':
        rotation = 180;
        break;
      default:
        rotation = -90;
    }

    return (
      <Group x={x} y={y} rotation={rotation}>
        <Line
          points={[0, 0, kickoff.pointRadius, 0]}
          stroke={color}
          strokeWidth={borderWidth}
        />
        <Line
          points={[0, -kickoff.pointRadius, 0, kickoff.pointRadius]}
          stroke={color}
          strokeWidth={borderWidth}
        />
      </Group>
    );
  }, []);

  const renderLIntersection = useCallback(({ x, y }, direction = 'up', color = LINE_COLOR) => {
    let rotation = 0;
    switch (direction) {
      case 'right':
        rotation = 90;
        break;
      case 'down':
        rotation = 180;
        break;
      case 'left':
        rotation = -90;
        break;
      default:
        rotation = 0;
    }

    return (
      <Group x={x} y={y} rotation={rotation}>
        <Line
          points={[
            -kickoff.pointRadius * 1.2,
            0,
            0,
            0,
            0,
            -kickoff.pointRadius * 1.2,
          ]}
          stroke={color}
          strokeWidth={borderWidth}
          lineJoin="miter"
        />
      </Group>
    );
  }, []);

  const renderGoalpost = useCallback(({ x, y }, color = LINE_COLOR) => (
    <Rect
      x={x - kickoff.pointRadius * 0.9}
      y={y - kickoff.pointRadius * 0.9}
      width={kickoff.pointRadius * 1.8}
      height={kickoff.pointRadius * 1.8}
      fill={color}
    />
  ), []);

  const gridLines = useMemo(() => (
    <>
      {/* Vertical Lines */}
      {[...Array(Math.floor(fieldDimension.length / 150) + 1)].map((_, i) => {
        const x = i * 150;
        return (
          <React.Fragment key={`v-grid-${x}`}>
            <Line
              points={[
                offset.x + x,
                offset.y,
                offset.x + x,
                offset.y + fieldDimension.width,
              ]}
              stroke="#CCCCCC"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Text
              key={`label-x-${i * 150}`}
              x={offset.x + i * 150}
              y={offset.y + fieldDimension.width + 10}
              text={`${i * 150}`}
              fontSize={14}
              width={30}
              align="left"
              fill="#CCCCCC"
            />
          </React.Fragment>
        )
      })}
      {/* Horizontal Lines */}
      {[...Array(Math.floor(fieldDimension.width / 150) + 1)].map((_, i) => {
        const y = i * 150;
        return (
          <React.Fragment key={`h-grid-${y}`}>
            <Line
              points={[
                offset.x,
                offset.y + y,
                offset.x + fieldDimension.length,
                offset.y + y,
            ]}
            stroke="#CCCCCC"
            strokeWidth={1}
            dash={[4, 4]}
          />
          <Text
            key={`label-y-${i * 150}`}
            x={offset.x - 40}
            y={offset.y + i * 150 - 5}
            text={`${i * 150}`}
            fontSize={14}
            width={30}
            align="right"
            fill="#CCCCCC"
          />
        </React.Fragment>
        )
      })}
    </>
  ), [offset.x, offset.y, fieldDimension.length, fieldDimension.width]);

  const fieldLines = useMemo(() => (
    <>
      {/* Border Line */}
      <Rect
        x={offset.x}
        y={offset.y}
        width={fieldDimension.length}
        height={fieldDimension.width}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {/* Center Line */}
      <Line
        points={[
          offset.x + fieldDimension.length / 2,
          offset.y,
          offset.x + fieldDimension.length / 2,
          offset.y + fieldDimension.width,
        ]}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {/* Center Circle */}
      <Circle
        x={offset.x + fieldDimension.length / 2}
        y={offset.y + fieldDimension.width / 2}
        radius={kickoff.circleRadius}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {/* Center Point */}
      {renderXIntersection(
        fieldToStage(fieldDimension.length / 2, fieldDimension.width / 2)
      )}
      {/* Penalty Area (Home) */}
      <Rect
        x={offset.x}
        y={offset.y + (fieldDimension.width - penaltyArea.width) / 2}
        width={penaltyArea.length}
        height={penaltyArea.width}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />

      {/* Penalty Area (Opponent) */}
      <Rect
        x={offset.x + fieldDimension.length - penaltyArea.length}
        y={offset.y + (fieldDimension.width - penaltyArea.width) / 2}
        width={penaltyArea.length}
        height={penaltyArea.width}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {selectedField.goalArea && (
        <>
          {/* Goal Area (Home) */}
          <Rect
            x={offset.x}
            y={
              offset.y +
              (fieldDimension.width - selectedField.goalArea.width) / 2
            }
            width={selectedField.goalArea.length}
            height={selectedField.goalArea.width}
            stroke={LINE_COLOR}
            strokeWidth={borderWidth}
          />

          {/* Goal Area (Opponent) */}
          <Rect
            x={offset.x + fieldDimension.length - selectedField.goalArea.length}
            y={
              offset.y +
              (fieldDimension.width - selectedField.goalArea.width) / 2
            }
            width={selectedField.goalArea.length}
            height={selectedField.goalArea.width}
            stroke={LINE_COLOR}
            strokeWidth={borderWidth}
          />
        </>
      )}
      {/* Goal (Home) */}
      <Rect
        x={offset.x - goal.depth}
        y={offset.y + (fieldDimension.width - goal.width) / 2}
        width={goal.depth}
        height={goal.width}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {/* Goal (Opponent) */}
      <Rect
        x={offset.x + fieldDimension.length}
        y={offset.y + (fieldDimension.width - goal.width) / 2}
        width={goal.depth}
        height={goal.width}
        stroke={LINE_COLOR}
        strokeWidth={borderWidth}
      />
      {/* Penalty Point (Home) */}
      {renderXIntersection(fieldToStage(penaltyPoint.x, penaltyPoint.y))}
      {/* Penalty Point (Opponent) */}
      {renderXIntersection(
        fieldToStage(fieldDimension.length - penaltyPoint.x, penaltyPoint.y)
      )}
    </>
  ), [
    offset.x,
    offset.y,
    fieldDimension.length,
    fieldDimension.width,
    penaltyArea,
    goal,
    selectedField,
    renderXIntersection,
    fieldToStage,
  ]);

  const renderLineToObject = useCallback(({ x, y }, color = LINE_COLOR) => {
    const robotPos = fieldToStage(robotPose.x, robotPose.y);
    return (
      <Line
        points={[x, y, robotPos.x, robotPos.y]}
        stroke={color}
        strokeWidth={2}
        dash={[8, 4]}
        opacity={0.5}
      />
    );
  }, [robotPose.x, robotPose.y, fieldToStage]);

  const projectedObjectsElements = useMemo(() => projectedObjects.map((obj) => {
    let direction = '';
    const globalPos = objectPosToField(obj.x, obj.y);
    const finalPos = fieldToStage(globalPos.x, globalPos.y);

    let elements = null;

    switch (obj.label) {
      case 'ball':
        elements = (
          <>
            {renderBall(finalPos)}
            {renderLineToObject(finalPos, BALL_COLOR)}
          </>
        );
        break;
      case 'X-Intersection':
        elements = (
          <>
            {renderXIntersection(finalPos, 'cyan')}
            {renderLineToObject(finalPos, 'cyan')}
          </>
        );
        break;
      case 'T-Intersection':
        if (globalPos.x < 200) {
          direction = 'right';
        } else if (globalPos.x > 700) {
          direction = 'left';
        } else {
          direction = globalPos.y < 300 ? 'down' : 'up';
        }
        elements = (
          <>
            {renderTIntersection(finalPos, direction, 'yellow')}
            {renderLineToObject(finalPos, 'yellow')}
          </>
        );
        break;
      case 'L-Intersection':
        if (globalPos.x < 50) {
          direction = globalPos.y < 300 ? 'down' : 'right';
        } else if (globalPos.x > 850) {
          direction = globalPos.y < 300 ? 'left' : 'up';
        } else if (globalPos.x < 450) {
          direction = globalPos.y < 300 ? 'left' : 'up';
        } else {
          direction = globalPos.y < 300 ? 'down' : 'right';
        }
        elements = (
          <>
            {renderLIntersection(finalPos, direction, 'pink')}
            {renderLineToObject(finalPos, 'pink')}
          </>
        );
        break;
      case 'goalpost':
        elements = (
          <>
            {renderGoalpost(finalPos, 'red')}
            {renderLineToObject(finalPos, 'red')}
          </>
        );
        break;
      case 'robot':
        elements = (
          <>
            {renderOtherRobot(finalPos, 'gray')}
            {renderLineToObject(finalPos, 'gray')}
          </>
        );
        break;
      default:
        return null;
    }

    const id = `${obj.label}-${Math.round(globalPos.x)}-${Math.round(globalPos.y)}`;

    return (
      <React.Fragment key={id}>
        {elements}
      </React.Fragment>
    );
  }), [
    projectedObjects,
    objectPosToField,
    fieldToStage,
    renderBall,
    renderXIntersection,
    renderTIntersection,
    renderLIntersection,
    renderGoalpost,
    renderLineToObject,
  ]);

  const particlesElements = useMemo(() => {
    if (!particles?.particles || particles.particles.length === 0) return null;

    const particlesToRender = [];
    const positionMap = new Map();

    for (let i = 0; i < particles.particles.length; i += 1) {
      const particle = particles.particles[i];
      const gridX = Math.round(particle.x);
      const gridY = Math.round(particle.y);
      const key = `${gridX},${gridY}`;

      if (!positionMap.has(key)) {
        positionMap.set(key, particle);
        particlesToRender.push(particle);
      }
    }

    return particlesToRender.map((particle, index) => {
      const finalPos = fieldToStage(particle.x, particle.y);

      return (
        <Circle
          key={`particle-${index}`}
          x={finalPos.x}
          y={finalPos.y}
          radius={3}
          fill="rgb(255, 0, 0)"
        />
      );
    });
  }, [particles, fieldToStage]);

  const estimatedPoseElement = useMemo(() => {
    if (!particles?.estimated_pose) return null;

    const estimatedPose = particles.estimated_pose;
    const pos = fieldToStage(estimatedPose.x, estimatedPose.y);
    const endX = estimatedPose.x + Math.cos(estimatedPose.orientation) * ROBOT_RADIUS;
    const endY = estimatedPose.y + Math.sin(estimatedPose.orientation) * ROBOT_RADIUS;
    const endPos = fieldToStage(endX, endY);

    return (
      <>
        <Circle
          x={pos.x}
          y={pos.y}
          radius={ROBOT_RADIUS}
          fill="transparent"
          stroke="black"
        />
        <Line
          points={[pos.x, pos.y, endPos.x, endPos.y]}
          stroke="black"
          strokeWidth={2}
        />
      </>
    );
  }, [particles?.estimated_pose, fieldToStage]);

  const kickDirectionElement = useMemo(() => {
    const shouldRender = projectedObjects.some(
      (obj) => obj.label === 'ball' && obj.x < 150.0 && obj.y < 150.0,
    );

    if (!shouldRender) return null;

    const rad = (kickDirection * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let maxDist = KICK_LINE_LENGTH;

      if (dx > 0)
        maxDist = Math.min(maxDist, (fieldDimension.length - robotPose.x) / dx);
      if (dx < 0) maxDist = Math.min(maxDist, (0 - robotPose.x) / dx);
      if (dy > 0)
        maxDist = Math.min(maxDist, (fieldDimension.width - robotPose.y) / dy);
      if (dy < 0) maxDist = Math.min(maxDist, (0 - robotPose.y) / dy);

    const endX = robotPose.x + dx * maxDist;
    const endY = robotPose.y + dy * maxDist;
    const startPos = fieldToStage(robotPose.x, robotPose.y);
    const endPos = fieldToStage(endX, endY);

    return (
      <Arrow
        points={[startPos.x, startPos.y, endPos.x, endPos.y]}
        stroke={KICK_LINE_COLOR}
        fill={KICK_LINE_COLOR}
        strokeWidth={3}
        pointerLength={4}
        pointerWidth={4}
        lineCap="round"
        dash={[5, 10]}
      />
    );
  }, [projectedObjects, kickDirection, robotPose, fieldToStage]);

  const markersElements = useMemo(() => {
    if (!markers || markers.length === 0) return null;

    return markers.map((marker, index) => {
      const color = `rgba(${marker.color.r * 255},
                          ${marker.color.g * 255},
                          ${marker.color.b * 255},
                          ${marker.color.a})`;

      const globalPos = objectPosToField(marker.x, marker.y);
      const pos = fieldToStage(globalPos.x, globalPos.y);

      switch (marker.type) {

        // Sphere
        case 2:
          return (
            <Circle
              key={`marker-${index}`}
              x={pos.x}
              y={pos.y}
              radius={marker.scale?.x || 5}
              fill={color}
            />
          );

        // Cube
        case 1:
          return (
            <Rect
              key={`marker-${index}`}
              x={pos.x - marker.scale.x / 2}
              y={pos.y - marker.scale.y / 2}
              width={marker.scale.x}
              height={marker.scale.y}
              fill={color}
            />
          );

        // Line strip
        case 4: {
          const points = marker.points.flatMap((p) => {
            const stage = fieldToStage(p.x, p.y);
            return [stage.x, stage.y];
          });

          return (
            <Line
              key={`marker-${index}`}
              points={points}
              stroke={color}
              strokeWidth={2}
            />
          );
        }

        // Line list
        case 5: {
          const points = marker.points.flatMap((p) => {
            const stage = fieldToStage(p.x, p.y);
            return [stage.x, stage.y];
          });

          return (
            <Line
              key={`marker-${index}`}
              points={points}
              stroke={color}
              strokeWidth={2}
            />
          );
        }

        // Points
        case 8:
          return marker.points.map((p, i) => {
            const stage = fieldToStage(p.x, p.y);
            return (
              <Circle
                key={`marker-${index}-${i}`}
                x={stage.x}
                y={stage.y}
                radius={3}
                fill={color}
              />
            );
          });

        default:
          return null;
      }
    });
  }, [markers, fieldToStage]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
      }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        style={{ backgroundColor: FIELD_COLOR }}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {gridLines}
          {fieldLines}
          {kickDirectionElement}
          {particlesElements}
          {robotElement}
          {estimatedPoseElement}
          {markersElements}
          {projectedObjectsElements}

          {cursor && (
            <Text
              text={`X: ${cursor.x}, Y: ${cursor.y}`}
              x={30}
              y={20}
              fontSize={22}
              fontFamily="Arial"
              fontStyle="bold"
              fill={LINE_COLOR}
              padding={5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default FieldMap;
