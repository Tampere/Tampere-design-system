import { type LoaderProps, Loader as MantineLoader } from '@mantine/core';
import { LoadingIndicatorStyles } from './LoadingIndicators.css.ts';

export const LoadingSpinner = (props: {
  size?: LoaderProps['size'];
  style?: LoaderProps['style'];
}) => <MantineLoader role="progressbar" className={LoadingIndicatorStyles} {...props} />;
