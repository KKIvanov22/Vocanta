import psycopg2 as pg 


class DataAccess:
	def __init__(self, host, port, dbname, user, password):
		self.connection = pg.connect(
			host=host,
			port=port,
			dbname=dbname,
			user=user,
			password=password,
		)

	def close(self):
		if self.connection:
			self.connection.close()
