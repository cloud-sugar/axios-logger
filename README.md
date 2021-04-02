# axios-logger

An Axios decorator that provides request logging.

## Usage Example
```javascript
import axiosDefault from 'axios';
import { AxiosLogger } from '@cloudsugar/axios-logger';

const axios = new AxiosLogger({
  axios: axiosDefault, 
  stream: console
});

const res = await axios.get('https://npmjs.com');
```
