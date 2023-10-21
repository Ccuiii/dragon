import request, { ResponseError } from "./src/request";
import { useRequest, usePersistFn, useSize, useEcharts} from './src/hooks';

export default request
export *  from 'ahooks'
export { ResponseError, useRequest, usePersistFn, useSize, useEcharts };