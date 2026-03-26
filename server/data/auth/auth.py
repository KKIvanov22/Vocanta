from data.data_access import DataAccess
from werkzeug.security import check_password_hash, generate_password_hash


class Auth(DataAccess):
	def __init__(self, host, port, dbname, user, password):
		super().__init__(host, port, dbname, user, password)
		self.CreateUserTable()

	def CreateUserTable(self):
		query = """
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				username VARCHAR(255) NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		"""

		try:
			with self.connection.cursor() as cursor:
				cursor.execute(query)
				self.connection.commit()
		except Exception:
			self.connection.rollback()
			raise

	def login(self, email, password):
		query = """
			SELECT id, username, email, password
			FROM users
			WHERE email = %s
			LIMIT 1
		"""

		with self.connection.cursor() as cursor:
			cursor.execute(query, (email,))
			row = cursor.fetchone()
			if not row:
				return None
			if not check_password_hash(row[3], password):
				return None

			return {
				"id": row[0],
				"username": row[1],
				"email": row[2],
			}

	def register(self, username, email, password):
		query = """
			INSERT INTO users (username, email, password)
			VALUES (%s, %s, %s)
			RETURNING id, username, email
		"""
		hashed_password = generate_password_hash(password)

		try:
			with self.connection.cursor() as cursor:
				cursor.execute(query, (username, email, hashed_password))
				row = cursor.fetchone()
				self.connection.commit()

				return {
					"id": row[0],
					"username": row[1],
					"email": row[2],
				}
		except Exception:
			self.connection.rollback()
			raise

	def user_get(self, user_id):
		query = """
			SELECT id, username, email
			FROM users
			WHERE id = %s
			LIMIT 1
		"""

		with self.connection.cursor() as cursor:
			cursor.execute(query, (user_id,))
			row = cursor.fetchone()
			if not row:
				return None

			return {
				"id": row[0],
				"username": row[1],
				"email": row[2],
			}
