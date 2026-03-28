import psycopg2 as pg 


class DataAccess:
	def __init__(self):
		DB_HOST = os.getenv("DB_HOST", "localhost")
		DB_PORT = os.getenv("DB_PORT", "5432")
		DB_NAME = os.getenv("DB_NAME", "vocanta")
		DB_USER = os.getenv("DB_USER", "postgres")
		DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
		self.connection = pg.connect(
			host=DB_HOST,
			port=DB_PORT,
			dbname=DB_NAME,
			user=DB_USER,
			password=DB_PASSWORD,
		)

	def close(self):
		if self.connection:
			self.connection.close()
