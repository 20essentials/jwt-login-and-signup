import express from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { UserDb } from './localDatabase.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
process.loadEnvFile();
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;
const __dirname = import.meta.dirname;
const port = process.env.PORT ?? '4321';
const app = express();
const server = createServer(app);
const clientDirectory = join(__dirname, 'client');
const viewDirectory = join(__dirname, 'views');

app.set('view engine', 'pug');
app.set('views', viewDirectory);

app.use(express.static(clientDirectory));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, _, next) => {
  const token = req.cookies?.access_token ?? '';
  req.session = null;
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session = data;
  } catch (_) {}

  next();
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', redirectToPrivateIfThereIsSession, (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/signup', redirectToPrivateIfThereIsSession, (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

const authOnly = (req, res, next) => {
  if (!req.session) return res.redirect('/login');
  next();
};

function redirectToPrivateIfThereIsSession(req, res, next) {
  if (req.session) return res.redirect('/private');
  next();
}

app.get('/private', authOnly, (req, res) => {
  res.render('private', { title: 'This content is Private 😅' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await UserDb.getUser({ username, password });
  const { error, message, userFromDb } = result;

  if (error) {
    return res.json({ success: false, message });
  }

  if (req.session) return res.json({ success: true, message });

  const token = jwt.sign(
    { username: userFromDb.username, password: userFromDb.password },
    SECRET_JWT_KEY,
    { expiresIn: '1h' }
  );

  return res
    .cookie('access_token', token, {
      // sameSite: 'strict',
      // secure: process.env?.NODE_ENV === 'production',
      sameSite: 'lax', //CodeSandbox
      secure: false, //CodeSandbox
      maxAge: 60 * 1000 * 60,
      httpOnly: true
    })
    .json({ success: true, message });
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const result = await UserDb.createUser({ username, password });
  const { error, message, userFromDb } = result;
  if (error) {
    return res.json({ success: false, message });
  }

  if (req.session) return res.json({ success: true, message });

  const token = jwt.sign(
    { username: userFromDb.username, password: userFromDb.password },
    SECRET_JWT_KEY,
    { expiresIn: '1h' }
  );

  return res
    .cookie('access_token', token, {
      sameSite: 'strict',
      secure: process.env?.NODE_ENV === 'production',
      maxAge: 60 * 1000 * 60,
      httpOnly: true
    })
    .json({ success: true, message });
});

app.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  req.session = null;
  res.redirect('/login');
});

server.listen(port, () => {
  console.log(`Server Open in http://localhost:${port}`);
});
