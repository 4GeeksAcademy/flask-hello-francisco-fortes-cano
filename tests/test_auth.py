import sys
import unittest
from pathlib import Path
from datetime import timedelta
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import check_password_hash
from api.models import db, User
from api.routes import api

class AuthTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://', JWT_SECRET_KEY='test-only-key-with-at-least-32-characters')
        db.init_app(self.app)
        JWTManager(self.app)
        self.app.register_blueprint(api, url_prefix='/api')
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()
        self.client = self.app.test_client()
        self.credentials = {'email': 'Test@example.com', 'password': 'Prueba123!'}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def test_registration_and_duplicate(self):
        result = self.client.post('/api/signup', json=self.credentials)
        self.assertEqual(result.status_code, 201)
        self.assertNotIn('password', result.json['user'])
        user = db.session.execute(db.select(User)).scalar_one()
        self.assertEqual(user.email, 'test@example.com')
        self.assertNotEqual(user.password, self.credentials['password'])
        self.assertTrue(check_password_hash(user.password, self.credentials['password']))
        self.assertEqual(self.client.post('/api/signup', json=self.credentials).status_code, 409)

    def test_invalid_input(self):
        for data in [None, [], {}, {'email': 2, 'password': 'Prueba123!'}, {'email': 'bad', 'password': 'Prueba123!'}, {'email': 'a@b.es', 'password': 'short'}]:
            self.assertEqual(self.client.post('/api/signup', json=data).status_code, 400)

    def test_login_and_private(self):
        self.client.post('/api/signup', json=self.credentials)
        result = self.client.post('/api/token', json=self.credentials)
        self.assertEqual(result.status_code, 200)
        headers = {'Authorization': 'Bearer ' + result.json['access_token']}
        private = self.client.get('/api/private', headers=headers)
        self.assertEqual(private.status_code, 200)
        self.assertEqual(private.json['user']['email'], 'test@example.com')
        self.assertEqual(self.client.post('/api/token', json={**self.credentials, 'password': 'wrong'}).status_code, 401)
        self.assertEqual(self.client.get('/api/private').status_code, 401)
        self.assertIn(self.client.get('/api/private', headers={'Authorization': 'Bearer inventado'}).status_code, [401, 422])
        expired = create_access_token(identity='1', expires_delta=timedelta(seconds=-10))
        self.assertEqual(self.client.get('/api/private', headers={'Authorization': 'Bearer ' + expired}).status_code, 401)
        user = db.session.get(User, 1)
        user.is_active = False
        db.session.commit()
        self.assertEqual(self.client.get('/api/private', headers=headers).status_code, 401)
        self.assertEqual(self.client.post('/api/token', json=self.credentials).status_code, 401)

if __name__ == '__main__':
    unittest.main()
