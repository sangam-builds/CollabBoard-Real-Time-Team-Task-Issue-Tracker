const bcrypt = require("bcrypt");

// All seeded users share this password in dev, so you can log in as anyone
// while testing without juggling separate credentials. NEVER do this in
// a production seed — this file should only ever run against a local/dev DB.
const DEV_PASSWORD = "Password123!";
const SALT_ROUNDS = 10;

async function buildUsers() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  return [
    {
      email: "sarah.chen@collabboard.dev",
      passwordHash,
      displayName: "Sarah Chen",
      // Intended as the Owner of "Acme Corp" team once teams are seeded
    },
    {
      email: "james.okafor@collabboard.dev",
      passwordHash,
      displayName: "James Okafor",
      // Intended as an Admin
    },
    {
      email: "priya.nair@collabboard.dev",
      passwordHash,
      displayName: "Priya Nair",
      // Intended as an Admin
    },
    {
      email: "maya.lindqvist@collabboard.dev",
      passwordHash,
      displayName: "Maya Lindqvist",
      // Member — active contributor, creates and completes tasks
    },
    {
      email: "alex.kim@collabboard.dev",
      passwordHash,
      displayName: "Alex Kim",
      // Member — used for testing "assigned to me" and dependency scenarios
    },
    {
      email: "jordan.diaz@collabboard.dev",
      passwordHash,
      displayName: "Jordan Diaz",
      // Member — used for testing comment threads and mentions
    },
    {
      email: "wei.zhang@collabboard.dev",
      passwordHash,
      displayName: "Wei Zhang",
      // Member — used for testing "no tasks assigned yet" empty states
    },
    {
      email: "olivia.brennan@collabboard.dev",
      passwordHash,
      displayName: "Olivia Brennan",
      // Member on a second team — used for testing multi-team/cross-workspace isolation
    },
  ];
}

module.exports = { buildUsers, DEV_PASSWORD };
