import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Higher quality scaling for the phone mock and the donut chart edges.
Config.setChromiumOpenGlRenderer('angle');
