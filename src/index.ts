import {AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse} from 'axios';

interface Stream {
  readonly info: (args?: any[]) => void;
  readonly error: (args?: any[]) => void;
};

interface RequestData<T=any> {
  method: string;
  url: string;
  startTime: Date;
  endTime: Date;

  data?: any;
  config?: AxiosRequestConfig|null;
  response?: AxiosResponse<T>|null;
  error?: AxiosError|null;
}

interface Config {
  readonly stream: Stream;
  readonly axios: AxiosInstance;
  readonly format?: (data: RequestData) => any[];
}

type Callback<T> = () => Promise<AxiosResponse<T>>;

/**
 * The default Axios request formatter function
 */
function format<T=any>(request: RequestData<T>): any[] {
  const {method, url, data, config, response, error, startTime, endTime} = request;
  const status = (response || error?.response)?.status;
  const statusText = (response || error?.response)?.statusText;
  const ms = endTime.getTime() - startTime.getTime();
  return [method.toUpperCase(), `${status}/(${statusText})`, `${ms}ms`, url, {config, data, response, error}];
}

/**
 * An Axios decorator that provides request logging 
 */
export class AxiosLogger {
  private stream: Config['stream'];
  private axios: Required<Config>['axios'];
  private format: Required<Config>['format'];

  constructor(config: Config) {
    this.stream = config?.stream;
    this.axios = config.axios;
    this.format = config?.format || format;
  }

  private async send<T>(method: string, url: string, data: any, config: AxiosRequestConfig|undefined, request: Callback<T>): Promise<AxiosResponse> {
    let response: AxiosResponse<T>|null = null;
    let error: AxiosError|null = null;
    const startTime = new Date();
    try {
      response = await request();
      return response;
    } catch (e) {
      error = e;
      throw e;
    } finally {
      const endTime = new Date();
      const logLevel: 'info'|'error' = response ? 'info' : 'error';
      const content = this.format({method, url, data, config, response, error, startTime, endTime});
      this.stream[logLevel](...content);
    } 
  }

  public get defaults(): AxiosInstance['defaults'] {
    return this.axios.defaults;
  }

  public get interceptors(): AxiosInstance['interceptors'] {
    return this.axios.interceptors;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('delete', url, undefined, config, async () => {
      return await this.axios.delete<T>(url, config);
    });
  }

  public async head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('head', url, undefined, config, async () => {
      return await this.axios.head<T>(url, config);
    });
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('get', url, undefined, config, async () => {
      return await this.axios.get<T>(url, config);
    });
  }

  public async options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('options', url, undefined, config, async () => {
      return await this.axios.options(url, config);
    });
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('patch', url, data, config, async () => {
      return await this.axios.patch(url, data, config);
    });
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('post', url, data, config, async () => {
       return await this.axios.post(url, data, config);
    });
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('put', url, data, config, async () => {
      return await this.axios.put(url, data, config);
    });
  }

  public async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.send<T>('request', config.url || '', config.data, config, async () => {
      return await this.axios.request<T>(config);
    });
  }
}
  
  
