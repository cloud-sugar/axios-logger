import {AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse} from 'axios';

interface Options {
  format?: (request: RequestData) => any[];
  logger?: Logger;
}

interface Logger {
  readonly info: (args?: any[]) => void;
  readonly error: (args?: any[]) => void;
};

interface RequestData {
  config: AxiosRequestConfig;
  response: AxiosResponse|null;
  error: AxiosError|null;
  startTime: Date;
  endTime: Date;
}

/**
 * The default Axios request formatter function
 */
function formatDefault(request: RequestData): any[] {
  const {config, response, error, startTime, endTime} = request;
  const method = config?.method || '';
  const { url } = config;
  const status = (response || error?.response)?.status;
  const statusText = (response || error?.response)?.statusText;
  const ms = endTime.getTime() - startTime.getTime();
  return [method.toUpperCase(), `${status}/(${statusText})`, `${ms}ms`, url, {config, response, error}];
}

/**
 * Decorates an Axios instance with logging
 *
 * @example
 * import axiosDefault from 'axios';
 * import { axiosLogger } from '@cloudsugar/axios-logger';
 *
 * const axios = axiosLogger(axios, {logger: console});
 */
export function axiosLogger(axios: AxiosInstance, options: Options = {}) {
  const defaultAdapter = axios.defaults.adapter;
  if (!defaultAdapter) {
    throw new Error('axios.defaults.adapter is missing');
  }
  const formatData = options?.format || formatDefault;
  const logger = options?.logger || console;
  axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    let response: AxiosResponse|null = null;
    let error: AxiosError|null = null;
    const startTime = new Date();
    try {
      response = await defaultAdapter(config);
      return response;
    } catch (e) {
      error = e;
      throw e;
    } finally {
      const endTime = new Date();
      const logLevel: 'info'|'error' = response ? 'info' : 'error';
      const content = formatData({config, response, error, startTime, endTime});
      logger[logLevel](...content);
    }
  };
  return axios;
}
