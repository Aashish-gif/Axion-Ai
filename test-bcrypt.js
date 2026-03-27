const bcrypt = require('bcryptjs');

async function test() {
  const password = 'testpassword';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Hash:', hash);
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
  if (match) {
    console.log('Bcryptjs is working!');
  } else {
    console.error('Bcryptjs match failed!');
  }
}

test().catch(console.error);
