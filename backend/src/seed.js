const pool = require("./db");

module.exports = async function seed() {
  await pool.query(`
    INSERT INTO merchants (id, name, email, api_key, api_secret, is_active)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'Test Merchant',
      'test@example.com',
      'key_test_abc123',
      'secret_test_xyz789',
      true
    )
    ON CONFLICT (api_key) DO NOTHING;
  `);

  console.log("✅ Test merchant seeded");
};
