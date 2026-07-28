import { core } from './core';

export const focusRing = {
  outline: `${core.strokeWeight} solid ${core.focus.visible}`,
  outlineOffset: `calc(${core.strokeWeight} / 2)`,
};

export const focusRingInverted = {
  outline: `${core.strokeWeight} solid ${core.focus.visibleInverted}`,
  outlineOffset: `calc(${core.strokeWeight} / 2)`,
};
