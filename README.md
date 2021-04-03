# axios-logger

An Axios request logger.

## Usage Example
```javascript
import axiosDefault from 'axios';
import { AxiosLogger } from '@cloudsugar/axios-logger';

const axios = axiosLogger(axiosDefault, {logger: console});
const res = await axios.get('https://npmjs.com');
```
