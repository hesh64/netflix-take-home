import { CustomError, NotFoundError, UnsupportedKeyError, ControllerError } from '../../app/utils';

describe('Errors', () => {
  describe('CustomError', () => {
    it('should return string', () => {
      const error = new CustomError(400, 'message');

      expect(error.message == 'message').toBeTruthy();
      expect(error.code == 400).toBeTruthy();
      expect(('' + error) == error.toString()).toBeTruthy();
    });
  });
  describe('NotFoundError', () => {
    it('should return string', () => {
      const error = new NotFoundError(400, 'message');

      expect(error.message == 'message').toBeTruthy();
      expect(error.code == 400).toBeTruthy();
      expect(('' + error) == error.toString()).toBeTruthy();
    });
  });
  describe('UnsupportedKeyError', () => {
    it('should return json', () => {
      const error = new UnsupportedKeyError(400, 'message');

      expect(error.message == 'message').toBeTruthy();
      expect(error.code == 400).toBeTruthy();
      expect(('' + error) == error.toString()).toBeTruthy();
    });
  });
  describe('ControllerError', () => {
    it('should return json', () => {
      const error = new ControllerError(400, 'message');

      expect(error.message == 'message').toBeTruthy();
      expect(error.code == 400).toBeTruthy();
      expect(('' + error) == error.toString()).toBeTruthy();
    });
  });
});
