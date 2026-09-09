import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    text,
    font,
    components: { fileList, list: listVars },
  },
} = vars;

export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  // The gap between the filename and the remove button within a row — `list`
  // above has no gap between rows themselves, matching Figma's flush 48px rows.
  gap: fileList.spacing,
  padding: `${fileList.padding.vertical} 0`,
});

export const name = style({
  color: text.primary,
  fontSize: listVars.fontSize,
  lineHeight: listVars.lineHeight,
  letterSpacing: font.letterSpacing,
  // A long filename must wrap inside its row rather than push the remove
  // button out of the container.
  overflowWrap: 'anywhere',
});
