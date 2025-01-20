import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime

class ConnectDatabase:
    def __init__(self):
        self._host = "roundhouse.proxy.rlwy.net"
        self._user = "root"
        self._password = "wpJHHCyKGvvksavNQQsNzRfzvBTDHgSf"
        self._database = "railway"
        self._port = 32117
        
        self.con = None
        self.cursor = None

    def get_connection(self):
        """Create a new database connection"""
        try:
            connection = mysql.connector.connect(
                host=self._host,
                user=self._user,
                password=self._password,
                database=self._database,
                port=self._port
            )
            return connection
        except Error as e:
            print(f"Error connecting to MySQL database: {e}")
            return None

    def register(self, name, email, password):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                print("Failed to establish database connection")
                return "Database connection failed"

            cursor = connection.cursor(dictionary=True)

            # Check if user exists first
            cursor.execute("SELECT * FROM users WHERE Email = %s", (email,))
            if cursor.fetchone():
                print(f"Email {email} already exists")
                return "Email already exists"

            # Hash the password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            # Insert new user
            sql = "INSERT INTO users (Name, Email, Password) VALUES (%s, %s, %s)"
            try:
                cursor.execute(sql, (name, email, hashed_password.decode('utf-8')))
                connection.commit()
                print(f"User {email} registered successfully!")
                return "success"
            except mysql.connector.Error as insert_error:
                print(f"Insert Error Details: Errno: {insert_error.errno}, SQLState: {insert_error.sqlstate}, Msg: {insert_error}")
                connection.rollback()
                return f"Insert error: {insert_error}"

        except mysql.connector.Error as e:
            print(f"MySQL Error Details: Errno: {e.errno}, SQLState: {e.sqlstate}, Msg: {e}")
            if connection:
                connection.rollback()
            return f"Registration error: {e}"
        except Exception as e:
            print(f"Unexpected error during registration: {e}")
            if connection:
                connection.rollback()
            return f"Unexpected error: {e}"
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def login(self, email, password):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return "Database connection failed"

            cursor = connection.cursor(dictionary=True)

            # Check if user exists
            cursor.execute("SELECT * FROM users WHERE Email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return "Email does not exist"

            # Verify password
            if bcrypt.checkpw(password.encode('utf-8'), user['Password'].encode('utf-8')):
                return "True details"
            else:
                return "Incorrect password"

        except Error as e:
            print(f"Login error: {e}")
            return str(e)
        finally:
            if connection:
                if cursor:
                    cursor.close()
                connection.close()
    
    def get_user_name(self, email):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()  # Get the connection
            if not connection:
                return None  # Return None if connection fails

            cursor = connection.cursor()  # Create the cursor from the connection

            query = "SELECT Name FROM users WHERE Email = %s"
            cursor.execute(query, (email,))
            result = cursor.fetchone()

            return result[0] if result else None

        except Error as e:
            print(f"Error fetching user name: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def get_user_id(self, email):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()  # Get the connection
            if not connection:
                return None  # Return None if connection fails

            cursor = connection.cursor()  # Create the cursor from the connection

            query = "SELECT user_id FROM users WHERE Email = %s"
            cursor.execute(query, (email,))
            result = cursor.fetchone()

            return result[0] if result else None

        except Error as e:
            print(f"Error fetching id: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    # Save visual acuity test result
    def VisualAcuity_save_test_result(self, user_id, right_eye_level, right_eye_incorrect, left_eye_level, left_eye_incorrect, feedback):
        try:
            con = self.get_connection()
            cursor = con.cursor()

            cursor.execute('''
                INSERT INTO visual_acuity(user_id, right_eye_max_level, right_eye_incorrect, left_eye_max_level, left_eye_incorrect, feedback)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (user_id, right_eye_level, right_eye_incorrect, left_eye_level, left_eye_incorrect, feedback))

            con.commit()
            con.close()

            return True  # Return True if the operation was successful
        except Exception as e:
            print(f"Error saving to DB: {e}")
            return False  # Return False if an error occurred
        
    def ColorVision_save_test_result(self,user_id,correctAnswers,incorrectAnswers,feedBack):
        try:
            con = self.get_connection()
            cursor = con.cursor()

            cursor.execute('''
                INSERT INTO color_vision(user_id,correct_answers,incorrect_answers,feedback)
                VALUES (%s, %s, %s, %s)
            ''', (user_id,correctAnswers,incorrectAnswers,feedBack))

            con.commit()
            con.close()

            return True  # Return True if the operation was successful
        except Exception as e:
            print(f"Error saving to DB: {e}")
            return False  # Return False if an error occurred
        
    def ContrastVision_save_test_result(self, user_id, score, incorrect_answers, feedback):
        try:
            con = self.get_connection()
            if not con:
                print("Failed to get database connection")
                return False
                
            cursor = con.cursor()
            cursor.execute('''
                INSERT INTO contrast_vision(user_id, score, incorrect_answers, feedback)
                VALUES (%s, %s, %s, %s)
            ''', (user_id, score, incorrect_answers, feedback))

            con.commit()
            return True
            
        except Exception as e:
            print(f"Error saving contrast vision results: {e}")
            if con:
                con.rollback()
            return False
            
        finally:
            if cursor:
                cursor.close()
            if con:
                con.close()

    def BlurCheck_save_test_result(self, user_id, score, incorrect_answers, feedback):
        try:
            con = self.get_connection()
            cursor = con.cursor()

            cursor.execute('''
                INSERT INTO blur_check(user_id, score, incorrect_answers, feedback)
                VALUES (%s, %s, %s, %s)
            ''', (user_id, score, incorrect_answers, feedback))

            con.commit()
            con.close()
            return True
        except Exception as e:
            print(f"Error saving to DB: {e}")
            return False

    def WatchDot_save_test_result(self, user_id, score, incorrect_answers, feedback):
        try:
            con = self.get_connection()
            cursor = con.cursor()

            cursor.execute('''
                INSERT INTO watch_dot(user_id, score, incorrect_answers, feedback)
                VALUES (%s, %s, %s, %s)
            ''', (user_id, score, incorrect_answers, feedback))

            con.commit()
            con.close()
            return True
        except Exception as e:
            print(f"Error saving to DB: {e}")
            return False

    def get_total_tests_count(self, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return 0

            cursor = connection.cursor()
            
            # Combined query to count tests from all tables
            query = """
                SELECT COUNT(*) AS total_tests
                FROM (
                    SELECT test_id FROM blur_check WHERE user_id = %s
                    UNION ALL
                    SELECT test_id FROM color_vision WHERE user_id = %s
                    UNION ALL
                    SELECT test_id FROM contrast_vision WHERE user_id = %s
                    UNION ALL
                    SELECT test_id FROM visual_acuity WHERE user_id = %s
                    UNION ALL
                    SELECT test_id FROM watch_dot WHERE user_id = %s
                ) AS all_tests;
            """
            cursor.execute(query, (user_id, user_id, user_id, user_id, user_id))
            return cursor.fetchone()[0]

        except Exception as e:
            print(f"Error getting total tests count: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


    def update_profile(self, user_id, username, email):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return "Database connection failed"
            cursor = connection.cursor(dictionary=True)
            
            # Check if email is already in use by another user
            cursor.execute("SELECT user_id FROM users WHERE Email = %s AND user_id != %s", (email, user_id))
            if cursor.fetchone():
                return "Email already in use"
            # Update user profile
            cursor.execute("UPDATE users SET Name = %s, Email = %s WHERE user_id = %s", 
                        (username, email, user_id))
            connection.commit()
            return "success"
        except Error as e:
            print(f"Profile update error: {e}")
            return str(e)
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    def change_password(self, user_id, current_password, new_password):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return "Database connection failed"
            cursor = connection.cursor(dictionary=True)
            
            # Verify current password
            cursor.execute("SELECT Password FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return "User not found"

            # Check if the current password matches the hashed password in the database
            if not bcrypt.checkpw(current_password.encode('utf-8'), user['Password'].encode('utf-8')):
                return "Current password is incorrect"

            # Hash the new password
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

            # Update password in the database
            cursor.execute("UPDATE users SET Password = %s WHERE user_id = %s", 
                        (hashed_password.decode('utf-8'), user_id))
            connection.commit()
            return "success"
        except Exception as e:
            print(f"Password change error: {e}")
            return str(e)
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def delete_account(self, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return "Database connection failed"
            cursor = connection.cursor()
            
            # Delete all related records first
            cursor.execute("DELETE FROM visual_acuity WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM color_vision WHERE user_id = %s", (user_id,))
            
            # Delete user account
            cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
            connection.commit()
            return "success"
        except Error as e:
            print(f"Account deletion error: {e}")
            return str(e)
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


    def test_count(self, user_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return {}

            cursor = connection.cursor()

            # Single query to count tests from all tables
            query = """
                SELECT 'visual_acuity' AS test_name, COUNT(*) AS test_count FROM visual_acuity WHERE user_id = %s
                UNION ALL
                SELECT 'color_vision', COUNT(*) FROM color_vision WHERE user_id = %s
                UNION ALL
                SELECT 'contrast_vision', COUNT(*) FROM contrast_vision WHERE user_id = %s
                UNION ALL
                SELECT 'blur_check', COUNT(*) FROM blur_check WHERE user_id = %s
                UNION ALL
                SELECT 'watch_dot', COUNT(*) FROM watch_dot WHERE user_id = %s
            """
            cursor.execute(query, (user_id, user_id, user_id, user_id, user_id))
            
            # Fetch all results into a dictionary
            results = cursor.fetchall()
            return {row[0]: row[1] for row in results}

        except Exception as e:
            print(f"Error getting test counts: {e}")
            return {}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_test_reports(self, user_id):
        connection = self.get_connection()
        if not connection:
            return []

        cursor = connection.cursor(dictionary=True)
        try:
            query = """
                SELECT test_id AS id, 'Blur Check' AS test_name, test_date, 
                    CAST(score AS UNSIGNED) AS obtained_score, 
                    5 AS total_tests,
                    CONCAT(score, '/', 5) AS score_display, 
                    CASE WHEN score >= 3 THEN 'Pass' ELSE 'Fail' END AS status, feedback
                FROM blur_check WHERE user_id = %s
                UNION ALL
                SELECT test_id AS id, 'Color Vision', test_date, 
                    CAST(correct_answers AS UNSIGNED) AS obtained_score, 
                    7 AS total_tests,
                    CONCAT(correct_answers, '/', 7) AS score_display, 
                    CASE WHEN correct_answers >= 4 THEN 'Pass' ELSE 'Fail' END AS status, feedback
                FROM color_vision WHERE user_id = %s
                UNION ALL
                SELECT test_id AS id, 'Contrast Vision', test_date, 
                    CAST(score AS UNSIGNED) AS obtained_score, 
                    17 AS total_tests,
                    CONCAT(score, '/', 17) AS score_display, 
                    CASE WHEN score >= 9 THEN 'Pass' ELSE 'Fail' END AS status, feedback
                FROM contrast_vision WHERE user_id = %s
                UNION ALL
                SELECT test_id AS id, 'Visual Acuity', test_date, 
                    CAST(right_eye_max_level + left_eye_max_level AS UNSIGNED) AS obtained_score, 
                    34 AS total_tests,
                    CONCAT(right_eye_max_level, '/17, ', left_eye_max_level, '/17') AS score_display, 
                    CASE WHEN (right_eye_max_level + left_eye_max_level) >= 18 THEN 'Pass' ELSE 'Fail' END AS status, feedback
                FROM visual_acuity WHERE user_id = %s
                UNION ALL
                SELECT test_id AS id, 'Watch Dot', test_date, 
                    CAST(score AS UNSIGNED) AS obtained_score, 
                    2 AS total_tests,
                    CONCAT(score, '/', 2) AS score_display, 
                    CASE WHEN score = 2 THEN 'Pass' ELSE 'Fail' END AS status, feedback
                FROM watch_dot WHERE user_id = %s
                ORDER BY test_date DESC;
            """
            cursor.execute(query, (user_id, user_id, user_id, user_id, user_id))
            return cursor.fetchall()
        except Exception as e:
            print(f"Error fetching test reports: {e}")
            return []
        finally:
            cursor.close()
            connection.close()




    def get_report_details(self, report_id):
        connection = self.get_connection()
        if not connection:
            return None

        cursor = connection.cursor(dictionary=True)
        try:
            query = """
                SELECT 'Blur Check' AS test_name, score, feedback, test_date
                FROM blur_check WHERE test_id = %s
                UNION ALL
                SELECT 'Color Vision', correct_answers AS score, feedback, test_date
                FROM color_vision WHERE test_id = %s
                UNION ALL
                SELECT 'Contrast Vision', score, feedback, test_date
                FROM contrast_vision WHERE test_id = %s
                UNION ALL
                SELECT 'Visual Acuity', (right_eye_max_level + left_eye_max_level) / 2 AS score, feedback, test_date
                FROM visual_acuity WHERE test_id = %s
                UNION ALL
                SELECT 'Watch Dot', score, feedback, test_date
                FROM watch_dot WHERE test_id = %s;
            """
            cursor.execute(query, (report_id, report_id, report_id, report_id, report_id))
            return cursor.fetchone()
        except Exception as e:
            print(f"Error fetching report details: {e}")
            return None
        finally:
            cursor.close()
            connection.close()


    def get_test_report_by_id(self, test_id, test_name):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if not connection:
                return None

            cursor = connection.cursor(dictionary=True)

            # Execute the query
            query = """
                SELECT 
                    watch_dot.test_id AS test_id, 
                    'Watch Dot' AS test_name, 
                    watch_dot.test_date, 
                    watch_dot.score AS obtained_score, 
                    2 AS total_tests, 
                    NULL AS left_eye_max_level, 
                    NULL AS right_eye_max_level, 
                    NULL AS left_eye_incorrect, 
                    NULL AS right_eye_incorrect, 
                    watch_dot.feedback
                FROM watch_dot
                WHERE watch_dot.test_id = %s AND 'Watch Dot' = %s

                UNION ALL

                SELECT 
                    blur_check.test_id AS test_id, 
                    'Blur Check' AS test_name, 
                    blur_check.test_date, 
                    blur_check.score AS obtained_score, 
                    5 AS total_tests, 
                    NULL AS left_eye_max_level, 
                    NULL AS right_eye_max_level, 
                    NULL AS left_eye_incorrect, 
                    NULL AS right_eye_incorrect, 
                    blur_check.feedback
                FROM blur_check
                WHERE blur_check.test_id = %s AND 'Blur Check' = %s

                UNION ALL

                SELECT 
                    contrast_vision.test_id AS test_id, 
                    'Contrast Vision' AS test_name, 
                    contrast_vision.test_date, 
                    contrast_vision.score AS obtained_score, 
                    17 AS total_tests, 
                    NULL AS left_eye_max_level, 
                    NULL AS right_eye_max_level, 
                    NULL AS left_eye_incorrect, 
                    NULL AS right_eye_incorrect, 
                    contrast_vision.feedback
                FROM contrast_vision
                WHERE contrast_vision.test_id = %s AND 'Contrast Vision' = %s

                UNION ALL

                SELECT 
                    color_vision.test_id AS test_id, 
                    'Color Vision' AS test_name, 
                    color_vision.test_date, 
                    color_vision.correct_answers AS obtained_score, 
                    7 AS total_tests, 
                    NULL AS left_eye_max_level, 
                    NULL AS right_eye_max_level, 
                    NULL AS left_eye_incorrect, 
                    NULL AS right_eye_incorrect, 
                    color_vision.feedback
                FROM color_vision
                WHERE color_vision.test_id = %s AND 'Color Vision' = %s

                UNION ALL

                SELECT 
                    visual_acuity.test_id AS test_id, 
                    'Visual Acuity' AS test_name, 
                    visual_acuity.test_date, 
                    NULL AS obtained_score, 
                    34 AS total_tests, 
                    visual_acuity.left_eye_max_level, 
                    visual_acuity.right_eye_max_level, 
                    visual_acuity.left_eye_incorrect, 
                    visual_acuity.right_eye_incorrect, 
                    visual_acuity.feedback
                FROM visual_acuity
                WHERE visual_acuity.test_id = %s AND 'Visual Acuity' = %s;
            """
            
            cursor.execute(query, (test_id, test_name, test_id, test_name, test_id, test_name, test_id, test_name, test_id, test_name))
            result = cursor.fetchone()
            return result if result else None

        except Exception as e:
            print(f"Error fetching test report by id ({test_id}): {e}")
            return None

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def update_glasses_status(self, user_id, wears_glasses):#Update glasses status in the database
        try:
            con = self.get_connection()
            if con is not None:
                cursor = con.cursor()
                query = "UPDATE users SET glasses = %s WHERE user_id = %s"
                cursor.execute(query, (wears_glasses, user_id))
                con.commit()
                return True
        except Error as e:
            print(f"Error updating glasses status: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
#-------------------------------------------------Password Reset--------------------------------------------------------------------
    def set_password_reset_token(self, email, token, expiry):
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            query = """
                UPDATE users 
                SET password_reset_token = %s, token_expiry = %s 
                WHERE Email = %s
            """
            cursor.execute(query, (token, expiry, email))
            connection.commit()
            return True
        except Exception as e:
            print(f"Error setting reset token: {e}")
            return False
        finally:
            cursor.close()
            connection.close()

    def verify_reset_token(self, token):
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT user_id FROM users 
                WHERE password_reset_token = %s AND token_expiry > %s
            """
            cursor.execute(query, (token, datetime.now()))
            return cursor.fetchone()
        except Exception as e:
            print(f"Error verifying reset token: {e}")
            return None
        finally:
            cursor.close()
            connection.close()

    def update_password(self, email, new_password):
        try:
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            connection = self.get_connection()
            cursor = connection.cursor()
            query = """
                UPDATE users 
                SET Password = %s, password_reset_token = NULL, token_expiry = NULL 
                WHERE Email = %s
            """
            cursor.execute(query, (hashed_password.decode('utf-8'), email))
            connection.commit()
            return True
        except Exception as e:
            print(f"Error updating password: {e}")
            return False
        finally:
            cursor.close()
            connection.close()


    def get_user_by_email(self, email):
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            query = "SELECT * FROM users WHERE Email = %s"
            cursor.execute(query, (email,))
            return cursor.fetchone()  # Returns user data if found
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None
        finally:
            cursor.close()
            connection.close()

    def get_email_by_reset_token(self, token):
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT Email 
                FROM users 
                WHERE password_reset_token = %s AND token_expiry > %s
            """
            cursor.execute(query, (token, datetime.now()))
            result = cursor.fetchone()
            return result['Email'] if result else None
        except Exception as e:
            print(f"Error fetching email by reset token: {e}")
            return None
        finally:
            cursor.close()
            connection.close()

    def delete_reset_token(self, token):
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            query = """
                UPDATE users 
                SET password_reset_token = NULL, token_expiry = NULL 
                WHERE password_reset_token = %s
            """
            cursor.execute(query, (token,))
            connection.commit()
            return True
        except Exception as e:
            print(f"Error deleting reset token: {e}")
            return False
        finally:
            cursor.close()
            connection.close()




