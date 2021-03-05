const app = require('../app');

const request = require('supertest');

describe('gae_node_request_example', () => {
  describe('GET /api/', () => {
    it('should get 200', done => {
      request(app).get('/api/').expect(200, done);
    });

    it('should get Hello World', done => {
      request(app).get('/api/').expect('Hello, world!', done);
    });
  });
});
