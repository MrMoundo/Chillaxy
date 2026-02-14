import express from "express";
import fs from "fs-extra";

const router = express.Router();
const ADMINS_FILE = "./data/admins.json";
const AUTO_ROLE_ID = "1352081296154824744";
const AUTO_ROLE_MEMBERS_FILE = "./data/auto_role_members.json";


async function readAutoRoleMembers(){
  const exists = await fs.pathExists(AUTO_ROLE_MEMBERS_FILE);
  if (!exists) return [];

  const data = await fs.readJson(AUTO_ROLE_MEMBERS_FILE).catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function writeAutoRoleMembers(memberIds){
  const unique = [...new Set(memberIds.filter(Boolean))];
  await fs.writeJson(AUTO_ROLE_MEMBERS_FILE, unique, { spaces: 2 });
}

async function ensureGuildMember(userId, userAccessToken){
  const guildId = process.env.GUILD_ID;
  const botToken = process.env.BOT_TOKEN;

  if (!guildId || !botToken || !userId || !userAccessToken) return;

  const endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ access_token: userAccessToken })
    });

    if (!response.ok) {
      console.error("Failed to ensure guild membership", {
        userId,
        status: response.status
      });
    }
  } catch (error) {
    console.error("Failed to ensure guild membership", { userId, error });
  }
}

async function assignAutoRole(userId){
  const guildId = process.env.GUILD_ID;
  const botToken = process.env.BOT_TOKEN;

  if (!guildId || !botToken || !userId) return;

  const endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${AUTO_ROLE_ID}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`
      }
    });

    if (!response.ok) {
      console.error("Failed to auto-assign role", {
        userId,
        status: response.status
      });
      return;
    }

    const currentMembers = await readAutoRoleMembers();
    await writeAutoRoleMembers([...currentMembers, userId]);
  } catch (error) {
    console.error("Failed to auto-assign role", { userId, error });
  }
}

async function getRoleMemberCount(){
  const guildId = process.env.GUILD_ID;
  const botToken = process.env.BOT_TOKEN;

  const cachedMembers = await readAutoRoleMembers();

  if (!guildId || !botToken) return cachedMembers.length || null;

  let after = "0";
  let total = 0;

  try {
    while (true) {
      const endpoint = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch members for role count", { status: response.status });
        return cachedMembers.length || null;
      }

      const members = await response.json();
      if (!Array.isArray(members) || !members.length) break;

      total += members.filter(member => Array.isArray(member.roles) && member.roles.includes(AUTO_ROLE_ID)).length;
      after = members[members.length - 1].user?.id || after;

      if (members.length < 1000) break;
    }

    if (total > 0) {
      const allMemberIds = await getRoleMemberIdsFromApi(guildId, botToken);
      if (allMemberIds.length) {
        await writeAutoRoleMembers(allMemberIds);
      }
    }

    return total;
  } catch (error) {
    console.error("Failed to fetch role member count", error);
    return cachedMembers.length || null;
  }
}

async function getRoleMemberIdsFromApi(guildId, botToken){
  let after = "0";
  const memberIds = [];

  try {
    while (true) {
      const endpoint = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      });

      if (!response.ok) return memberIds;

      const members = await response.json();
      if (!Array.isArray(members) || !members.length) break;

      for (const member of members) {
        if (Array.isArray(member.roles) && member.roles.includes(AUTO_ROLE_ID) && member.user?.id) {
          memberIds.push(member.user.id);
        }
      }

      after = members[members.length - 1].user?.id || after;
      if (members.length < 1000) break;
    }

    return memberIds;
  } catch {
    return memberIds;
  }
}

/* ===== LOGIN ===== */
router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    scope: "identify guilds.join",
    redirect_uri: process.env.REDIRECT_URI
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

/* ===== CALLBACK ===== */
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.REDIRECT_URI);

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const token = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const user = await userRes.json();
  const admins = await fs.readJson(ADMINS_FILE);

  req.session.user = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    isAdmin: admins.includes(user.id)
  };

  await ensureGuildMember(user.id, token.access_token);
  await assignAutoRole(user.id);

  res.redirect("/");
});

router.get("/role-info", async (_req, res) => {
  const count = await getRoleMemberCount();
  res.json({ count });
});

/* ===== CURRENT USER ===== */
router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json(null);
  res.json(req.session.user);
});

/* ===== LOGOUT ===== */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
