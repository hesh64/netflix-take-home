import path   from 'path';

//we are using a different path than the default path
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../', './config');
import config from 'config';

import { app } from './app/controller';

// IT'S OVER 9000!! --> Please lookup the meme in case you are wondering haha
app.listen(config.get('http.port'), () => {
  console.log("It's lit!");
});
