import { type LoaderProps, Loader as MantineLoader } from '@mantine/core';
import { loader } from './Loader.css.ts';

export const Loader = (props: { size?: LoaderProps['size']; style?: LoaderProps['style'] }) => (
  <MantineLoader className={loader} {...props} />
);
