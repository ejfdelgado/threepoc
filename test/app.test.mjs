import request from "supertest"
import app from "../app.mjs"

describe('gae_node_request_example', () => {
  describe('GET /api/tup/fecha', () => {
    it('should get 200', done => {
      request(app).get('/api/utiles/').expect(200, done);
    });
  });
});
