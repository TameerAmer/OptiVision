from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, make_response
from DB_connection import ConnectDatabase
from fpdf import FPDF
import os
import bcrypt
import secrets
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'OptiVision_Tameer_Redan'  

db = ConnectDatabase()

@app.route('/')
def login():
    if 'user_name' in session:
        session.clear()  # Clear any existing session
    response = make_response(render_template('login.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/login', methods=['POST'])
def login_process():
    email = request.form['email']
    password = request.form['password']
    
    result = db.login(email, password)
    
    if result == "True details":
        user_id = db.get_user_id(email)
        session['user_id'] = user_id
        session['user_email'] = email
        session['user_name'] = db.get_user_name(email)
        return redirect(url_for('dashboard'))
    elif result == "Email does not exist":
        flash('Email does not exist', 'error')
    else:
        flash('Incorrect password', 'error')
    
    return redirect(url_for('login'))

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register_process():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    confirm_password = request.form['confirm_password']
    if len(password) < 6:
        flash('Password must be at least 6 characters', 'error')
        return redirect(url_for('register'))
    if password != confirm_password:
        flash('Passwords do not match', 'error')
        return redirect(url_for('register'))
    
    result = db.register(name, email, password)
    
    if result == "success":
        flash('Successfully Registered!', 'success')
        return redirect(url_for('login'))
    elif result == "Email already exists":
        flash('Email already exists', 'error')
    else:
        flash(f'Registration failed: {result}', 'error')
    
    return redirect(url_for('register'))

@app.route('/dashboard')
def dashboard():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    user_name = session['user_name']
    
    total_tests = db.get_total_tests_count(user_id)
    
    response = make_response(render_template('dashboard.html', 
        user_name=user_name, 
        total_tests=total_tests
    ))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/logout')
def logout():
    session.clear()
    response = make_response(redirect(url_for('login')))
    response.set_cookie('session', '', expires=0)
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/allTests')
def allTests():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']

    # Get all test counts in one query
    test_counts = db.test_count(user_id)

    user_name = session['user_name']
    response = make_response(
        render_template(
            'allTests.html', 
            user_name=user_name,
            visual_acuity=test_counts.get('visual_acuity', 0),
            color_vision=test_counts.get('color_vision', 0),
            contrast_vision=test_counts.get('contrast_vision', 0),
            blur_check=test_counts.get('blur_check', 0),
            watch_dot=test_counts.get('watch_dot', 0)
        )
    )
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response


@app.route('/VisualAcuityTest')
def VisualAcuityTest():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_name = session['user_name']
    response = make_response(render_template('VisualAcuityTest.html', user_name=user_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/ColorVisionTest')
def ColorVisionTest():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_name = session['user_name']
    response = make_response(render_template('ColorVisionTest.html', user_name=user_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/ContrastVisionTest')
def ContrastVisionTest():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_name = session['user_name']
    response = make_response(render_template('ContrastVisionTest.html', user_name=user_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/BlurCheckTest')
def BlurCheckTest():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_name = session['user_name']
    response = make_response(render_template('BlurCheckTest.html', user_name=user_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/WatchTheDotTest')
def WatchTheDotTest():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    user_name = session['user_name']
    response = make_response(render_template('WatchTheDotTest.html', user_name=user_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/Visual_Acuity_save_results', methods=['POST'])
def Visual_Acuity_save_results():
    data = request.get_json()
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    
    user_id = session['user_id']
    success = db.VisualAcuity_save_test_result(
        user_id, 
        data.get('rightEyeLevel'),
        data.get('rightEyeIncorrect'),
        data.get('leftEyeLevel'),
        data.get('leftEyeIncorrect'),
        data.get('feedBack')
    )
    
    if success:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Failed to save results'}), 500

@app.route('/Color_Vision_save_results', methods=['POST'])
def Color_Vision_save_results():
    data = request.get_json()
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    
    user_id = session['user_id']
    success = db.ColorVision_save_test_result(
        user_id,
        data.get('score'),
        data.get('incorrectanswers'),
        data.get('feedBack')
    )
    
    if success:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Failed to save results'}), 500

@app.route('/Contrast_Vision_save_results', methods=['POST'])
def Contrast_Vision_save_results():
    try:
        data = request.get_json()
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not logged in'}), 401
        
        user_id = session['user_id']
        success = db.ContrastVision_save_test_result(
            user_id,
            data.get('score'),
            data.get('incorrectAnswers'),
            data.get('feedback')
        )
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to save to database'}), 500
            
    except Exception as e:
        print(f"Error in Contrast_Vision_save_results: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/Blur_Check_save_results', methods=['POST'])
def Blur_Check_save_results():
    data = request.get_json()
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    
    user_id = session['user_id']
    success = db.BlurCheck_save_test_result(
        user_id,
        data.get('score'),
        data.get('incorrectAnswers'),
        data.get('feedback')
    )
    
    if success:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Failed to save results'}), 500

@app.route('/Watch_Dot_save_results', methods=['POST'])
def Watch_Dot_save_results():
    data = request.get_json()
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    
    user_id = session['user_id']
    success = db.WatchDot_save_test_result(
        user_id,
        data.get('score'),
        data.get('incorrectAnswers'),
        data.get('feedback')
    )
    
    if success:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Failed to save results'}), 500

@app.route('/TestsSection')
def TestsSection():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    response = make_response(render_template('TestsSection.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/reports')
def reports():
    if 'user_name' not in session:
        return redirect(url_for('login'))

    user_id = session['user_id']

    # Fetch aggregated test reports
    test_reports = db.get_test_reports(user_id)

    # Fetch available test types dynamically
    available_test_types = ["Blur Check", "Color Vision", "Contrast Vision", "Visual Acuity", "Watch Dot"]

    # Compute summary statistics
    total_tests = len(test_reports)
    average_test_score = (
        sum((report['obtained_score'] / report['total_tests']) * 100 
            for report in test_reports if report['obtained_score'] is not None and report['total_tests'] > 0) / total_tests
    ) if total_tests > 0 else 0

    # Prepare performance data for visualization
    performance_data = [
        {
            "date": report["test_date"],
            "test_name": report["test_name"],
            "score_percentage": (report["obtained_score"] / report["total_tests"]) * 100
        }
        for report in test_reports
        if report['obtained_score'] is not None and report['total_tests'] > 0
    ]   
    eye_health_status = (
        "Your vision health is excellent."
        if average_test_score >= 90 else
        "Strong vision with minor concerns."
        if average_test_score >= 70 else
        "Vision health requires improvement."
    ) if total_tests > 0 else "Complete tests for assessment."

    return render_template(
        'Reports.html',
        test_reports=test_reports,
        available_test_types=available_test_types,
        total_tests=total_tests,
        average_test_score=round(average_test_score, 2) if total_tests > 0 else "N/A",
        performance_data=performance_data, # Pass performance data to the template
        eye_health_status=eye_health_status
    )


@app.route('/settings')
def settings():
    if 'user_name' not in session:
        return redirect(url_for('login')) 
    user_email = session.get('user_email', 'Not provided')  # Default value
    user_name = session.get('user_name', 'Guest')
    response = make_response(render_template('Settings.html',user_name=user_name, user_email=user_email))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    user_id = session['user_id']
    username = request.form.get('username')
    email = request.form.get('email')
    
    try:
        result = db.update_profile(user_id, username, email)
        if result == "success":
            session['user_name'] = username  # Update session with new username
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
@app.route('/change_password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    user_id = session['user_id']
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    
    try:
        result = db.change_password(user_id, current_password, new_password)
        if result == "success":
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
@app.route('/delete_account', methods=['POST'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    user_id = session['user_id']
    
    try:
        result = db.delete_account(user_id)
        if result == "success":
            session.clear()  # Clear session after successful deletion
            return jsonify({'success': True, 'redirect': url_for('login')})
        else:
            return jsonify({'success': False, 'message': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    

class PDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')  
    def header(self):
        self.image("static/images/Colored.jpg", x=(self.w - 30) / 2, y=20, w=30)  # Center the logo
        self.set_y(60)  # Move below the logo for the title

        
        # Add the title
        self.set_font("Arial", style="B", size=16)
        self.set_text_color(0, 51, 102)  # Professional dark blue
        self.cell(0, 10, "OptiVision Test Report", ln=True, align="C")
        self.ln(10)  # Spacing after the title

    def footer(self):
        # Footer details
        self.set_y(-15)
        self.set_font("Arial", size=8)
        self.set_text_color(128)
        self.cell(0, 10, f"Generated by OptiVision 2025 | All rights reserved. | Created by Tameer and Redan ", align="C")

@app.route('/download_pdf/<int:test_id>/<test_name>')
def download_pdf(test_id, test_name):
    from urllib.parse import unquote
    decoded_test_name = unquote(test_name)  # Decode test name
    # Fetch test details
    test_report = db.get_test_report_by_id(test_id, decoded_test_name)
    if not test_report:
        return render_template("error.html", message="The requested test report was not found.")

    try:
        # Create a PDF
        pdf = PDF()
        pdf.add_page()

        pdf.set_font("Arial", size=11)
        pdf.cell(0, 10, f"User Name: {session['user_name']}", ln=True)
        # Test Name and Date
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 10, "Test Details:", ln=True)
        pdf.set_font("Arial", size=11)
        pdf.cell(0, 10, f"Test Name: {test_report.get('test_name', 'N/A')}", ln=True)
        pdf.cell(0, 10, f"Test Date: {test_report.get('test_date', 'N/A')}")
        pdf.ln(10)

        # Add Score Table
        pdf.set_font("Arial", style="B", size=12)
        pdf.set_fill_color(0, 51, 102)  # Dark blue background
        pdf.set_text_color(255, 255, 255)  # White text
        pdf.cell(80, 10, "Category", border=1, align="C", fill=True)
        pdf.cell(80, 10, "Score", border=1, align="C", fill=True)
        pdf.ln()

        pdf.set_text_color(0, 0, 0)  # Reset text color for rows
        pdf.set_font("Arial", size=11)

        if test_report["test_name"] == "Visual Acuity":
            # Display left eye scores
            pdf.cell(80, 10, "Left Eye Max Level", border=1)
            pdf.cell(80, 10, f"{test_report.get('left_eye_max_level', 'N/A')} / 17", border=1)
            pdf.ln()

            # Display left eye incorrect answers
            pdf.cell(80, 10, "Left Eye Incorrect", border=1)
            pdf.cell(80, 10, f"{test_report.get('left_eye_incorrect', 'N/A')}", border=1)
            pdf.ln()

            # Display right eye scores
            pdf.cell(80, 10, "Right Eye Max Level", border=1)
            pdf.cell(80, 10, f"{test_report.get('right_eye_max_level', 'N/A')} / 17", border=1)
            pdf.ln()

            # Display right eye incorrect answers
            pdf.cell(80, 10, "Right Eye Incorrect", border=1)
            pdf.cell(80, 10, f"{test_report.get('right_eye_incorrect', 'N/A')}", border=1)
            pdf.ln()

        else:
            # General test score
            pdf.cell(80, 10, "Overall Score", border=1)
            pdf.cell(80, 10, f"{test_report.get('obtained_score', 'N/A')} / {test_report.get('total_tests', 'N/A')}", border=1)
            pdf.ln()

        pdf.ln(10)

        # Feedback Section
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 10, "Feedback:", ln=True)
        pdf.set_font("Arial", size=11)
        pdf.multi_cell(0, 10, test_report.get("feedback", "No feedback available."))
        pdf.ln(10)

        # Add Recommendations Section
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 10, "Our Recommendations:", ln=True)
        pdf.set_font("Arial", size=11)
        pdf.multi_cell(0, 10, 
            "1. Take regular breaks during screen time.\n"
            "2. Ensure adequate lighting when reading or working.\n"
            "3. Follow up with an eye care professional if issues persist.\n"
            "4. Keep your eyewear prescription up to date.\n"
            "5. Maintain a balanced diet with eye-healthy nutrients.\n"
        )

        # Use a temporary directory to save the PDF
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            pdf.output(tmp_file.name)
            tmp_file_path = tmp_file.name

        # Read the PDF content and serve it
        with open(tmp_file_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()

        # Clean up the temporary file
        os.remove(tmp_file_path)

        # Create response with PDF content
        response = make_response(pdf_content)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=Test_Report_{test_id}.pdf'

        return response

    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return render_template("error.html", message="An error occurred while generating the PDF report.")


@app.route('/glasses')
def glasses():
    if 'user_name' not in session:
        return redirect(url_for('login'))
    response = make_response(render_template('glasses.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    return response

@app.route('/update_glasses_status', methods=['POST'])
def update_glasses_status():
    data = request.get_json()
    wears_glasses = data['wearsGlasses']
    user_id = session['user_id']  

    # Update database using the ConnectDatabase class method
    success = db.update_glasses_status(user_id, wears_glasses)
    return jsonify(success=success)


@app.route('/request_password_reset', methods=['GET', 'POST'])
def request_password_reset():
    if request.method == 'POST':
        email = request.form['email']
        user = db.get_user_by_email(email)  # Fetch user data by email
        if not user:
            flash('Email not found', 'error')
            return redirect(url_for('request_password_reset'))

        # Generate a secure token
        reset_token = secrets.token_urlsafe(32)
        db.set_password_reset_token(email, reset_token, datetime.now() + timedelta(hours=1))

        # Send the token via email
        reset_url = url_for('reset_password', token=reset_token, _external=True)
        send_reset_email(email, reset_url)

        flash('Password reset email sent. Check your inbox.', 'success')
        return redirect(url_for('login'))

    return render_template('request_password_reset.html')


@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    email = db.get_email_by_reset_token(token)  # Fetch email using the reset token
    if not email:
        flash('Invalid or expired token', 'error')
        return redirect(url_for('request_password_reset'))

    if request.method == 'POST':
        new_password = request.form['password']
        confirm_password = request.form['confirm_password']

        if new_password != confirm_password:
            flash('Passwords do not match', 'error')
            return redirect(url_for('reset_password', token=token))

        db.update_password(email, new_password)  # Update password
        db.delete_reset_token(token)  # Clean up the token after use

        flash('Password successfully reset. Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('reset_password.html', token=token)



def send_reset_email(to_email, reset_url):
    # Email credentials
    from_email = 'optivisionteam2025@gmail.com'
    app_password = 'wlkmzynuprmhwfls'  # Use the generated app password
    
    # Email content
    subject = 'Password Reset Request'
    body = f"Click the link below to reset your password:\n\n{reset_url}\n\nIf you did not request this, please ignore this email.\n\nCheers,\n\nThe OptiVision Team"

    # Create the email message
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    try:
        # Connect to Gmail SMTP server
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Start TLS encryption
            server.login(from_email, app_password)  # Use app password
            server.sendmail(from_email, to_email, msg.as_string())  # Send the email
            print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")


if __name__ == '__main__':
    app.run(debug=True)