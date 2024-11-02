const bcrypt = require('bcrypt');

const testPassword = 'iamironman'; // The password you registered

async function rehashAndCompare() {
    // Hash the password 
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Newly generated hash:', newHash);

    // Now compare the newly generated hash with the original stored hash
    const isMatch = await bcrypt.compare(testPassword, newHash);
    console.log('Password match result (should be true):', isMatch);
    console.log('Length of testPassword:', testPassword.length);
console.log('Length of storedHash:', newHash.length);
}

rehashAndCompare();
