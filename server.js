const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: '10.0.0.145',
  user: 'bluebird_user',
  password: 'password',
  database: 'bluebirdhotel'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// 회원가입 API
app.post('/signup', (req, res) => {
  const { Username, Email, Password, idnum, address } = req.body;

  if (!Username || !Email || !Password || !idnum || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // 이메일이 이미 존재하는지 체크
  db.query('SELECT * FROM signup WHERE Email = ?', [Email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 새 사용자 등록
    db.query(
      'INSERT INTO signup (Username, Email, Password, idnum, address) VALUES (?, ?, ?, ?, ?)',
      [Username, Email, Password, idnum, address],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(200).json({ message: 'User registered successfully', status: 'success' });
      }
    );
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  // 사용자 정보 조회
  db.query('SELECT * FROM signup WHERE Email = ? AND Password = ?', [Email, Password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user: results[0], status: 'success' });
  });
});

// 직원 로그인 API 처리
app.post('/employee-login', (req, res) => {
    const { Emp_Email, Emp_Password } = req.body;

    // 실제 데이터베이스에서 확인하는 로직이 필요합니다
    const query = 'SELECT * FROM employees WHERE email = ? AND password = ?';
    db.query(query, [Emp_Email, Emp_Password], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: '서버 오류' });
        }
        
        if (results.length > 0) {
            res.status(200).json({ status: 'success', message: '로그인 성공' });
        } else {
            res.status(401).json({ status: 'error', message: '이메일 또는 비밀번호가 잘못되었습니다' });
        }
    });
});



// 테스트 API
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test successful', status: 'Server is running' });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


