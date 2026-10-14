import { getDatabase } from '../models/database.js';

export const logActivity = async (userId, userName, action, entityType = null, entityId = null, entityTitle = null) => {
  try {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, entity_title) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, action, entityType, entityId, entityTitle]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};
