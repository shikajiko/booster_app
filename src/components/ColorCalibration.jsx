import React, { useContext, useEffect, useState, useRef } from 'react';
import { Service, ServiceRequest } from 'roslib';

import { Grid, TextField, Typography, Paper, Slider } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { useRos } from '../context/RosContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function ColorSettingsField({
  object,
  keys,
  min,
  max,
  minValueParam,
  maxValueParam,
  handleDisplay,
  handlePublish,
  handleInput,
  invertTrack = false,
}) {
  const [minValue, setMinValue] = useState(minValueParam);
  const [maxValue, setMaxValue] = useState(maxValueParam);

  useEffect(() => {
    setMinValue(minValueParam);
    setMaxValue(maxValueParam);
  }, [minValueParam, maxValueParam]);

  return (
    <Grid container justifyContent="center" alignItems="center" py={1.5}>
      <Grid item xs={2.5}>
        <Typography>
          {keys.toUpperCase()}
          {keys === 'a' && ' (GREEN ↔ RED)'}
          {keys === 'b' && ' (BLUE ↔ YELLOW)'}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <TextField
          variant="standard"
          error={minValue < min || minValue > maxValue}
          value={minValue}
          type="number"
          helperText={
            minValue < min || minValue > maxValue ? 'Out of range' : ''
          }
          InputProps={{
            inputProps: {
              style: { textAlign: 'center' },
            },
          }}
          size="small"
          onChange={(event) => {
            if (event.target.value === '') {
              setMinValue(0.0);
            } else {
              setMinValue(parseFloat(event.target.value));
            }
          }}
          onBlur={() => {
            handleDisplay(object, keys, 'min', minValue);
            handleInput(object, keys, 'min', minValue);
          }}
        />
      </Grid>
      <Grid item xs={4} mx={1.5}>
        {keys === 'hue' && (
          <div
            style={{
              height: '10px',
              width: '100%',
              borderRadius: '4px',
              marginBottom: '6px',
              background: `linear-gradient(to right,
              hsl(0, 100%, 50%),
              hsl(60, 100%, 50%),
              hsl(120, 100%, 50%),
              hsl(180, 100%, 50%),
              hsl(240, 100%, 50%),
              hsl(300, 100%, 50%),
              hsl(360, 100%, 50%))`,
            }}
          />
        )}
        <Slider
          value={
            typeof minValueParam === 'number' &&
            typeof maxValueParam === 'number'
              ? [minValueParam, maxValueParam]
              : [0, 0]
          }
          onChange={(event, newValue) => {
            handleDisplay(object, keys, 'slider', newValue);
            handleInput(object, keys, 'slider', newValue);
            setMinValue(newValue[0]);
            setMaxValue(newValue[1]);
          }}
          onChangeCommitted={handlePublish}
          min={min}
          max={max}
          valueLabelDisplay="auto"
          track={invertTrack ? 'inverted' : 'normal'}
          disableSwap
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          variant="standard"
          error={maxValue < minValue || maxValue > max}
          value={maxValue}
          type="number"
          helperText={
            maxValue < minValue || maxValue > max ? 'Out of range' : ''
          }
          InputProps={{
            inputProps: {
              style: { textAlign: 'center' },
            },
          }}
          size="small"
          onChange={(event) => {
            if (event.target.value === '') {
              setMaxValue(0.0);
            } else {
              setMaxValue(parseFloat(event.target.value));
            }
          }}
          onBlur={() => {
            handleDisplay(object, keys, 'max', maxValue);
            handleInput(object, keys, 'max', maxValue);
          }}
        />
      </Grid>
    </Grid>
  );
}

function hsvToRgb(h, s, v) {
  let r;
  let g;
  let b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function labToRgb(l, a, b) {
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const xyz = [x, y, z].map((val) => {
    const val3 = val ** 3;
    return val3 > 0.008856 ? val3 : (val - 16 / 116) / 7.787;
  });

  x = xyz[0] * 95.047;
  y = xyz[1] * 100.0;
  z = xyz[2] * 108.883;

  x /= 100;
  y /= 100;
  z /= 100;

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let blueVal = x * 0.0557 + y * -0.204 + z * 1.057;

  const adjust = (val) =>
    val > 0.0031308 ? 1.055 * val ** (1 / 2.4) - 0.055 : 12.92 * val;

  r = Math.min(Math.max(0, adjust(r)), 1);
  g = Math.min(Math.max(0, adjust(g)), 1);
  blueVal = Math.min(Math.max(0, adjust(blueVal)), 1);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(blueVal * 255)];
}

function ColorPreviewBox({ minHSV, maxHSV, invertHue }) {
  const canvasRef = useRef(null);
  const width = 200;
  const height = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: cvWidth, height: cvHeight } = canvas;

    ctx.clearRect(0, 0, cvWidth, cvHeight);

    const [minH, minS, minV] = minHSV;
    const [maxH, maxS, maxV] = maxHSV;

    for (let y = 0; y < cvHeight; y += 1) {
      let h;
      if (!invertHue) {
        h = minH + ((maxH - minH) * y) / cvHeight;
      } else {
        const halfHeight = cvHeight / 2;
        if (y < halfHeight) {
          h = (minH * y) / halfHeight;
        } else {
          h = maxH + ((360 - maxH) * (y - halfHeight)) / halfHeight;
        }
      }

      for (let x = 0; x < cvWidth; x += 1) {
        const s = minS + ((maxS - minS) * x) / cvWidth;
        const v = minV + ((maxV - minV) * x) / cvWidth;

        const [r, g, b] = hsvToRgb(h, s / 100, v / 100);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [minHSV.join(','), maxHSV.join(','), invertHue]);

  return (
    <Grid container justifyContent="center" alignItems="center" py={1.5}>
      <Grid item xs={2.5}>
        <Typography>PREVIEW</Typography>
      </Grid>
      <Grid item xs={8.3}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />
      </Grid>
    </Grid>
  );
}

function ColorPreviewBoxLAB({ minLAB, maxLAB }) {
  const canvasRef = useRef(null);
  const width = 200;
  const height = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: cvWidth, height: cvHeight } = canvas;

    const [minL, minA, minB] = minLAB;
    const [maxL, maxA, maxB] = maxLAB;

    for (let y = 0; y < cvHeight; y += 1) {
      const l = minL + ((maxL - minL) * y) / cvHeight;
      for (let x = 0; x < cvWidth; x += 1) {
        const a = minA + ((maxA - minA) * x) / cvWidth;
        const bVal = minB + ((maxB - minB) * x) / cvWidth;

        const [r, g, b] = labToRgb(l, a, bVal);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [minLAB.join(','), maxLAB.join(',')]);

  return (
    <Grid container justifyContent="center" alignItems="center" py={1.5}>
      <Grid item xs={2.5}>
        <Typography>PREVIEW</Typography>
      </Grid>
      <Grid item xs={8.3}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />
      </Grid>
    </Grid>
  );
}

function ColorCalibration() {
  const { colorCalibration, setColorCalibration } = useContext(AppContext);
  const { showLog } = useContext(LoggerContext);
  const { ros } = useRos();
  const getColorSettingServiceRef = useRef(null);
  const saveColorSettingServiceRef = useRef(null);
  const setColorSettingServiceRef = useRef(null);

  const [currentObject, setCurrentObject] = useState('field');
  const [objects, setObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const minMaxValue = {
    hue: { min: 0, max: 360 },
    saturation: { min: 0, max: 100 },
    value: { min: 0, max: 100 },
    lightness: { min: 0, max: 255 },
    a: { min: -128, max: 128 },
    b: { min: -128, max: 128 },
  };

  const [colorCalibrationDisplay, setColorCalibrationDisplay] = useState({
    ball: {
      invert_hue: false,
      use_lab: false,
      min_hsv: [0, 0, 0],
      max_hsv: [0, 0, 0],
      min_lab: [0, 0, 0],
      max_lab: [0, 0, 0],
    },
    field: {
      invert_hue: false,
      use_lab: false,
      min_hsv: [0, 0, 0],
      max_hsv: [0, 0, 0],
      min_lab: [0, 0, 0],
      max_lab: [0, 0, 0],
    },
  });

  getColorSettingServiceRef.current = new Service({
    ros,
    name: 'ninshiki_cpp/config/get_color_setting',
    messageType: 'ninshiki_interfaces/srv/GetColorSetting',
  });

  saveColorSettingServiceRef.current = new Service({
    ros,
    name: 'ninshiki_cpp/config/save_color_setting',
    messageType: 'ninshiki_interfaces/srv/SaveColorSetting',
  });

  setColorSettingServiceRef.current = new Service({
    ros,
    name: 'ninshiki_cpp/config/set_color_setting',
    messageType: 'ninshiki_interfaces/srv/SetColorSetting',
  });

  const handleFetch = () => {
    if (!ros) return;
    setIsLoading(true);

    // Fetch color calibration settings for all objects
    const getColorSettingRequest = new ServiceRequest({});
    getColorSettingServiceRef.current.callService(
      getColorSettingRequest,
      (response) => {
        setColorCalibration(JSON.parse(response.json_color));
        const newObjects = Object.keys(JSON.parse(response.json_color));
        setObjects(newObjects);
      },
      (error) => {
        showLog(`Failed to fetch color setting: ${error}`, 'error');
      }
    );

    setIsLoading(false);
  };

  const handleSave = () => {
    if (!ros) return;
    setIsLoading(true);

    const saveColorSettingRequest = new ServiceRequest({
      json_color: JSON.stringify(colorCalibration),
    });

    saveColorSettingServiceRef.current.callService(
      saveColorSettingRequest,
      (response) => {
        if (response.success) {
          showLog('Successfully saved color setting', 'success');
        }
      },
      (error) => {
        showLog(`Failed to save color setting: ${error}`, 'error');
      }
    );

    setIsLoading(false);
  };

  const handleReload = () => {
    handleFetch();
  };

  const handleRadioChange = (event) => {
    setCurrentObject(event.target.value);
  };

  useEffect(() => {
    handleFetch();
    const newObjects = Object.keys(colorCalibration);
    setObjects(newObjects);
  }, [ros]);

  const handlePublish = () => {
    if (!ros) return;

    Object.keys(colorCalibration).forEach((key) => {
      if (currentObject === key) {
        const isHueInvalid =
          colorCalibration[key].min_hsv[0] < minMaxValue.hue.min ||
          colorCalibration[key].max_hsv[0] > minMaxValue.hue.max;
        const isSatInvalid =
          colorCalibration[key].min_hsv[1] < minMaxValue.saturation.min ||
          colorCalibration[key].max_hsv[1] > minMaxValue.saturation.max;
        const isValInvalid =
          colorCalibration[key].min_hsv[2] < minMaxValue.value.min ||
          colorCalibration[key].max_hsv[2] > minMaxValue.value.max;
        const isLabLInvalid =
          colorCalibration[key].min_lab[0] > minMaxValue.lightness.max ||
          colorCalibration[key].max_lab[0] > minMaxValue.lightness.max;
        const isLabAInvalid =
          colorCalibration[key].min_lab[1] < minMaxValue.a.min ||
          colorCalibration[key].max_lab[1] > minMaxValue.a.max;
        const isLabBInvalid =
          colorCalibration[key].min_lab[2] < minMaxValue.b.min ||
          colorCalibration[key].max_lab[2] > minMaxValue.b.max;

        if (
          isHueInvalid ||
          isSatInvalid ||
          isValInvalid ||
          isLabLInvalid ||
          isLabAInvalid ||
          isLabBInvalid
        ) {
          return;
        }

        const setColorSettingRequest = new ServiceRequest({
          name: key,
          invert_hue: colorCalibration[key].invert_hue,
          use_lab: colorCalibration[key].use_lab,
          min_hue: colorCalibration[key].min_hsv[0],
          max_hue: colorCalibration[key].max_hsv[0],
          min_saturation: colorCalibration[key].min_hsv[1],
          max_saturation: colorCalibration[key].max_hsv[1],
          min_value: colorCalibration[key].min_hsv[2],
          max_value: colorCalibration[key].max_hsv[2],
          min_lightness: colorCalibration[key].min_lab[0],
          max_lightness: colorCalibration[key].max_lab[0],
          min_a: colorCalibration[key].min_lab[1],
          max_a: colorCalibration[key].max_lab[1],
          min_b: colorCalibration[key].min_lab[2],
          max_b: colorCalibration[key].max_lab[2],
        });

        setColorSettingServiceRef.current.callService(
          setColorSettingRequest,
          (response) => {
            if (!response.success) {
              showLog('Failed to set color setting', 'error');
            }
          },
          (error) => {
            showLog(`Failed to set color setting: ${error}`, 'error');
          }
        );
      }
    });
  };

  const changePublishedValue = () => {
    setColorCalibration(colorCalibrationDisplay);
  };

  const changeValue = (object, key, type, value) => {
    const newColorCalibrationDisplay = { ...colorCalibrationDisplay };
    const useLab = newColorCalibrationDisplay[object].use_lab;
    const [newValue] = [value];
    let index;

    switch (key) {
      case 'hue':
      case 'lightness':
        index = 0;
        break;
      case 'saturation':
      case 'a':
        index = 1;
        break;
      case 'value':
      case 'b':
        index = 2;
        break;
      default:
        index = -1;
        break;
    }

    const targetArrayMin = useLab
      ? newColorCalibrationDisplay[object].min_lab
      : newColorCalibrationDisplay[object].min_hsv;
    const targetArrayMax = useLab
      ? newColorCalibrationDisplay[object].max_lab
      : newColorCalibrationDisplay[object].max_hsv;

    switch (type) {
      case 'slider':
        [targetArrayMin[index], targetArrayMax[index]] = newValue;
        break;
      case 'min':
        if (value > targetArrayMax[index]) {
          targetArrayMin[index] = targetArrayMax[index];
        } else {
          targetArrayMin[index] = newValue;
        }
        break;
      case 'max':
        if (value < targetArrayMin[index]) {
          targetArrayMax[index] = targetArrayMin[index];
        } else {
          targetArrayMax[index] = newValue;
        }
        break;
      case 'invert_hue':
        newColorCalibrationDisplay[object].invert_hue = newValue;
        break;
      case 'use_lab':
        newColorCalibrationDisplay[object].use_lab = newValue;
        break;
      default:
        break;
    }

    return newColorCalibrationDisplay;
  };

  const changeDisplayedValue = (object, key, type, value) => {
    setColorCalibrationDisplay(changeValue(object, key, type, value));
  };

  const changeInputValue = (object, key, type, value) => {
    setColorCalibration(changeValue(object, key, type, value));
  };

  const handleInvertHueChange = (object, value) => {
    setColorCalibration(changeValue(object, 'invert_hue', 'invert_hue', value));
    setColorCalibrationDisplay(
      changeValue(object, 'invert_hue', 'invert_hue', value)
    );
  };

  const handleUseLabChange = (object, value) => {
    setColorCalibration(changeValue(object, 'use_lab', 'use_lab', value));
    setColorCalibrationDisplay(
      changeValue(object, 'use_lab', 'use_lab', value)
    );
    handlePublish();
  };

  useEffect(() => {
    handlePublish();
    setColorCalibrationDisplay(colorCalibration);
  }, [colorCalibration]);

  return (
    <Item>
      <FormControl sx={{ mx: 2 }}>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          value={currentObject}
          name="radio-buttons-group"
        >
          {objects.map((object) => (
            <FormControlLabel
              key={object}
              value={object}
              control={<Radio />}
              label={object.toUpperCase()}
              onChange={handleRadioChange}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Grid container direction="row">
        {Object.keys(colorCalibration).map(
          (key) =>
            currentObject === key && (
              <React.Fragment key={key}>
                <Grid container ml={3} mt={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={(event) => {
                          handleInvertHueChange(key, event.target.checked);
                        }}
                        checked={colorCalibration[key].invert_hue}
                      />
                    }
                    label="INVERT HUE"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={(event) =>
                          handleUseLabChange(key, event.target.checked)
                        }
                        checked={colorCalibration[key].use_lab}
                      />
                    }
                    label="USE LAB"
                  />
                </Grid>
                {!colorCalibration[key].use_lab ? (
                  <>
                    <ColorSettingsField
                      object={key}
                      keys="hue"
                      min={minMaxValue.hue.min}
                      max={minMaxValue.hue.max}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_hsv[0]}
                      maxValueParam={colorCalibration[key].max_hsv[0]}
                      invertTrack={colorCalibration[key].invert_hue}
                    />
                    <ColorSettingsField
                      object={key}
                      keys="saturation"
                      min={minMaxValue.saturation.min}
                      max={minMaxValue.saturation.max}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_hsv[1]}
                      maxValueParam={colorCalibration[key].max_hsv[1]}
                    />
                    <ColorSettingsField
                      object={key}
                      keys="value"
                      min={minMaxValue.value.min}
                      max={minMaxValue.value.max}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_hsv[2]}
                      maxValueParam={colorCalibration[key].max_hsv[2]}
                    />
                    <ColorPreviewBox
                      minHSV={colorCalibration[key].min_hsv}
                      maxHSV={colorCalibration[key].max_hsv}
                      invertHue={colorCalibration[key].invert_hue}
                    />
                  </>
                ) : (
                  <>
                    <ColorSettingsField
                      object={key}
                      keys="lightness"
                      min={0}
                      max={255}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_lab[0]}
                      maxValueParam={colorCalibration[key].max_lab[0]}
                    />
                    <ColorSettingsField
                      object={key}
                      keys="a"
                      min={-128}
                      max={127}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_lab[1]}
                      maxValueParam={colorCalibration[key].max_lab[1]}
                    />
                    <ColorSettingsField
                      object={key}
                      keys="b"
                      min={-128}
                      max={127}
                      handleDisplay={changeDisplayedValue}
                      handlePublish={changePublishedValue}
                      handleInput={changeInputValue}
                      minValueParam={colorCalibration[key].min_lab[2]}
                      maxValueParam={colorCalibration[key].max_lab[2]}
                    />
                    <ColorPreviewBoxLAB
                      minLAB={colorCalibration[key].min_lab}
                      maxLAB={colorCalibration[key].max_lab}
                    />
                  </>
                )}
              </React.Fragment>
            )
        )}
        <Grid container sx={{ justifyContent: 'end', mb: 2 }}>
          <LoadingButton
            onClick={handleSave}
            color="primary"
            variant="contained"
            sx={{ margin: 1, top: 5 }}
            loading={isLoading}
          >
            Save
          </LoadingButton>
          <LoadingButton
            onClick={handleReload}
            color="warning"
            variant="contained"
            sx={{ margin: 1, top: 5 }}
            loading={isLoading}
          >
            Reload
          </LoadingButton>
        </Grid>
      </Grid>
    </Item>
  );
}

export default ColorCalibration;
