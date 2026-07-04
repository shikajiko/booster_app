import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, styled, Paper } from '@mui/material';
import { Topic } from 'roslib';
import { useRos } from '../context/RosContext';

const KEY_DESCRIPTIONS = {
  w: 'X Move +5',
  a: 'A Move +2',
  s: 'X Move -5',
  d: 'A Move -2',
  shift: 'Stop',
  control: 'Left Hand',
  q: 'Y Move +5',
  e: 'Y Move -5',
  arrowup: 'Tilt Up',
  arrowdown: 'Tilt Down',
  arrowleft: 'Pan Left',
  arrowright: 'Pan Right',
  '.': 'Reset Pan',
  '/': 'Reset Head',
  1: 'Crawl Down',
  2: 'Crawl',
  3: 'Crawl Up',
  4: 'Motion 4',
  5: 'Step Up',
  6: 'Step Down',
  7: 'Motion 7',
  8: 'Walk Ready',
  m: 'Gripper +10',
  n: 'Gripper -10',
  u: 'Elbow Down',
  o: 'Elbow Up',
  i: 'Sho Pitch Up',
  k: 'Sho Pitch Down',
  j: 'Sho Roll Down',
  l: 'Sho Roll Up',
};

const KEY_LABELS = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  backspace: '⌫',
  tab: 'Tab',
  caps: 'Caps',
  enter: 'Enter',
  shift: 'Shift',
  control: 'Ctrl',
  win: 'Win',
  alt: 'Alt',
  spacebar: 'Space',
  menu: 'Menu',
  print: 'PrtSc',
  scroll: 'ScrLk',
  pause: 'Pause',
  insert: 'Ins',
  delete: 'Del',
  home: 'Home',
  end: 'End',
  pageup: 'PgUp',
  pagedown: 'PgDn',
};

const Key = styled(Paper)(({ theme, size = 1, active }) => ({
  flex: size,
  minWidth: 0,
  minHeight: 0,
  padding: theme.spacing(0.5),
  margin: theme.spacing(0.25),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.grey[200],
  color: active
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  transition: 'all 0.1s ease',
  '&:active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'scale(0.95)',
  },
}));

const KeyLabel = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '0.75rem',
  lineHeight: 1,
});

const KeyDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.6rem',
  color: theme.palette.text.secondary,
  lineHeight: 1,
}));

const KeyboardRow = styled(Box)({
  display: 'flex',
  width: '100%',
  marginBottom: 4,
});

function MiniDrcKeyboard() {
  const { ros } = useRos();
  const [activeKey, setActiveKey] = useState(null);
  const [modifiers, setModifiers] = useState({
    control: false,
    shift: false,
    alt: false,
  });

  const holdIntervalRef = useRef(null);

  // Publish key event to ROS
  const publishKeyEvent = (key) => {
    if (!ros) return;

    const keyboardEventPublisher = new Topic({
      ros,
      name: '/keyboard_event',
      messageType: 'competition_interfaces/msg/KeyboardEvent',
    });

    keyboardEventPublisher.publish({
      control: modifiers.control,
      shift: modifiers.shift,
      alt: modifiers.alt,
      key: key.toLowerCase(),
    });
  };

  // Toggle modifier state
  const toggleModifier = (modifier) => {
    const newState = !modifiers[modifier];
    setModifiers((prev) => ({
      ...prev,
      [modifier]: newState,
    }));
    publishKeyEvent(modifier);
  };

  const normalizeKey = (key) => {
    if (key === ' ') return 'spacebar';
    if (key === '.') return 'period';
    if (key === '/') return 'slash';
    return key.toLowerCase();
  };

  const startHoldingKey = (key) => {
    if (holdIntervalRef.current) return;

    publishKeyEvent(key);
    holdIntervalRef.current = setInterval(() => {
      publishKeyEvent(key);
    }, 50);
  };

  const stopHoldingKey = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleKeyClick = (key) => {
    setActiveKey(key);
    publishKeyEvent(key);
    setTimeout(() => setActiveKey(null), 150);
  };

  // Handle physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = normalizeKey(e.key);
      const holdKeys = [
        'arrowup',
        'arrowdown',
        'arrowleft',
        'arrowright',
        'j',
        'k',
        'l',
        'i',
      ];
      const isHoldKey = holdKeys.includes(key);
      const isModifierKey = ['control', 'shift', 'alt'].includes(key);

      if (isHoldKey) e.preventDefault();

      if (!isModifierKey) {
        setActiveKey(key);

        if (isHoldKey) {
          startHoldingKey(key);
        } else {
          publishKeyEvent(key);
          setTimeout(() => setActiveKey(null), 150);
        }
        return;
      }

      if (!e.repeat) {
        toggleModifier(key);
      }
    };

    const handleKeyUp = (e) => {
      const key = normalizeKey(e.key);
      const holdKeys = [
        'arrowup',
        'arrowdown',
        'arrowleft',
        'arrowright',
        'j',
        'k',
        'l',
        'i',
      ];

      if (holdKeys.includes(key)) {
        stopHoldingKey();
        setActiveKey(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ros, modifiers]);

  const renderKey = (key, label = key, size = 1) => {
    const virtualKey = key.toLowerCase();
    const isActive = activeKey === virtualKey;
    const isModifier = ['control', 'shift', 'alt'].includes(virtualKey);
    const isModifierActive = isModifier && modifiers[virtualKey];
    const hasDescription = KEY_DESCRIPTIONS[virtualKey];
    const displayLabel =
      KEY_LABELS[virtualKey] ||
      (label.length > 1 ? label : label.toUpperCase());

    return (
      <Key
        elevation={isActive || isModifierActive ? 1 : 2}
        size={size}
        active={isActive || isModifierActive}
        onClick={() =>
          isModifier ? toggleModifier(virtualKey) : handleKeyClick(virtualKey)
        }
        sx={{
          backgroundColor: isModifierActive ? 'primary.main' : undefined,
          color: isModifierActive ? 'primary.contrastText' : undefined,
        }}
      >
        {hasDescription ? (
          <>
            <KeyLabel variant="body2">{displayLabel}</KeyLabel>
            <KeyDescription variant="caption">
              {KEY_DESCRIPTIONS[virtualKey]}
            </KeyDescription>
          </>
        ) : (
          <KeyLabel variant="body2">{displayLabel}</KeyLabel>
        )}
      </Key>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Keyboard Area */}
      <Box sx={{ display: 'flex' }}>
        {/* Main Keys */}
        <Box sx={{ flex: 3 }}>
          {/* Main Keyboard Rows */}
          <KeyboardRow>
            {renderKey('`', '` ~', 1)}
            {renderKey('1', '1 !', 1)}
            {renderKey('2', '2 @', 1)}
            {renderKey('3', '3 #', 1)}
            {renderKey('4', '4 $', 1)}
            {renderKey('5', '5 %', 1)}
            {renderKey('6', '6 ^', 1)}
            {renderKey('7', '7 &', 1)}
            {renderKey('8', '8 *', 1)}
            {renderKey('9', '9 (', 1)}
            {renderKey('0', '0 )', 1)}
            {renderKey('-', '- _', 1)}
            {renderKey('=', '= +', 1)}
            {renderKey('backspace', '⌫', 1.5)}
          </KeyboardRow>

          <KeyboardRow>
            {renderKey('tab', 'Tab', 1.5)}
            {renderKey('q', 'Q', 1)}
            {renderKey('w', 'W', 1)}
            {renderKey('e', 'E', 1)}
            {renderKey('r', 'R', 1)}
            {renderKey('t', 'T', 1)}
            {renderKey('y', 'Y', 1)}
            {renderKey('u', 'U', 1)}
            {renderKey('i', 'I', 1)}
            {renderKey('o', 'O', 1)}
            {renderKey('p', 'P', 1)}
            {renderKey('[', '[ {', 1)}
            {renderKey(']', '] }', 1)}
            {renderKey('\\', '\\ |', 1.5)}
          </KeyboardRow>

          <KeyboardRow>
            {renderKey('caps', 'Caps', 1.75)}
            {renderKey('a', 'A', 1)}
            {renderKey('s', 'S', 1)}
            {renderKey('d', 'D', 1)}
            {renderKey('f', 'F', 1)}
            {renderKey('g', 'G', 1)}
            {renderKey('h', 'H', 1)}
            {renderKey('j', 'J', 1)}
            {renderKey('k', 'K', 1)}
            {renderKey('l', 'L', 1)}
            {renderKey(';', '; :', 1)}
            {renderKey("'", '\' "', 1)}
            {renderKey('enter', 'Enter', 2.25)}
          </KeyboardRow>

          <KeyboardRow>
            {renderKey('shift', 'Shift', 2.25)}
            {renderKey('z', 'Z', 1)}
            {renderKey('x', 'X', 1)}
            {renderKey('c', 'C', 1)}
            {renderKey('v', 'V', 1)}
            {renderKey('b', 'B', 1)}
            {renderKey('n', 'N', 1)}
            {renderKey('m', 'M', 1)}
            {renderKey(',', ', <', 1)}
            {renderKey('.', '. >', 1)}
            {renderKey('/', '/ ?', 1)}
            {renderKey('shift', 'Shift', 2.25)}
          </KeyboardRow>

          <KeyboardRow>
            {renderKey('control', 'Ctrl', 1.25)}
            {renderKey('win', 'Win', 1.25)}
            {renderKey('alt', 'Alt', 1.25)}
            {renderKey('space', 'Space', 15)}
            {renderKey('alt', 'Alt', 1.25)}
            {renderKey('menu', 'Menu', 1.25)}
            {renderKey('control', 'Ctrl', 1.25)}
          </KeyboardRow>
        </Box>

        {/* Navigation Cluster */}
        <Box sx={{ flex: 1, marginLeft: 2 }}>
          <KeyboardRow>
            {renderKey('insert', 'Ins', 1)}
            {renderKey('home', 'Home', 1)}
            {renderKey('pageup', 'PgUp', 1)}
          </KeyboardRow>
          <KeyboardRow>
            {renderKey('delete', 'Del', 1)}
            {renderKey('end', 'End', 1)}
            {renderKey('pagedown', 'PgDn', 1)}
          </KeyboardRow>
          <KeyboardRow sx={{ justifyContent: 'center' }}>
            {renderKey('arrowup', '↑', 1)}
          </KeyboardRow>
          <KeyboardRow>
            {renderKey('arrowleft', '←', 1)}
            {renderKey('arrowdown', '↓', 1)}
            {renderKey('arrowright', '→', 1)}
          </KeyboardRow>
        </Box>
      </Box>
    </Box>
  );
}

export default MiniDrcKeyboard;
