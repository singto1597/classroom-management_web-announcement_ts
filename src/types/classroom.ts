export interface UserRoom {
  room_id: number;
  server_id?: string;
  server_id_str?: string;
  room_code?: string;
  room_name: string;
  role: string;
  status: string; // ✨ เพิ่มบรรทัดนี้เข้าไปแค่นี้เลยครับ!
}