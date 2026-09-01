export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  member_number: number;
  email: string;
  /**
   * ISO 8601 datetime string
   */
  created_at: string;
  /**
   * Front-end only flag for when we need to do operations on the group of players but some players are not members/stored in the DB.
   */
  is_temporary?: boolean;
}