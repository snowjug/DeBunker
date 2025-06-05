 // Theme toggle functionality
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        // Load saved theme
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
        }

        // Handle custom percentage selection
        document.getElementById('requiredPercentage').addEventListener('change', function() {
            const customGroup = document.getElementById('customPercentageGroup');
            if (this.value === 'custom') {
                customGroup.classList.remove('hidden');
            } else {
                customGroup.classList.add('hidden');
            }
        });
        
        function showResult() {
            const total = parseInt(document.getElementById('totalClasses').value);
            const attended = parseInt(document.getElementById('attendedClasses').value);
            const requiredSelect = document.getElementById('requiredPercentage').value;
            const customRequired = parseInt(document.getElementById('customPercentage').value);
            
            if (isNaN(total) || total < 0) {
                showNotification('Please enter a valid number of total classes', 'error');
                return;
            }
            
            if (isNaN(attended) || attended < 0) {
                showNotification('Please enter a valid number of attended classes', 'error');
                return;
            }
            
            if (attended > total) {
                showNotification('Attended classes cannot be more than total classes', 'error');
                return;
            }
            
            let required;
            if (requiredSelect === 'custom') {
                if (isNaN(customRequired) || customRequired < 0 || customRequired > 100) {
                    showNotification('Please enter a valid custom percentage (0-100)', 'error');
                    return;
                }
                required = customRequired;
            } else {
                required = parseInt(requiredSelect);
            }
            
            const entry = {
                total: total,
                attended: attended,
                required: required
            };
            
            renderResult(entry);
            showNotification('Result calculated successfully!', 'success');
        }
        
        function clearForm() {
            document.getElementById('totalClasses').value = '';
            document.getElementById('attendedClasses').value = '';
            document.getElementById('requiredPercentage').value = '75';
            document.getElementById('customPercentage').value = '';
            document.getElementById('customPercentageGroup').classList.add('hidden');
            
            // Clear result
            const container = document.getElementById('resultContainer');
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🎓 Ready to calculate</h3>
                    <p>Enter your attendance details and click "Show Result" to see your analysis!</p>
                </div>
            `;
            
            showNotification('Form cleared', 'info');
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                ${type === 'success' ? 'background: linear-gradient(135deg, #4caf50, #45a049);' : ''}
                ${type === 'error' ? 'background: linear-gradient(135deg, #f44336, #d32f2f);' : ''}
                ${type === 'info' ? 'background: linear-gradient(135deg, #2196f3, #1976d2);' : ''}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }
        
        function calculateAttendance(entry) {
            const currentPercentage = (entry.attended / entry.total) * 100;
            const classesNeeded = Math.max(0, Math.ceil((entry.required * entry.total - 100 * entry.attended) / (100 - entry.required)));
            const canBunk = Math.floor((entry.attended - (entry.required * entry.total / 100)) / (entry.required / 100));
            
            return {
                currentPercentage: currentPercentage,
                classesNeeded: classesNeeded,
                canBunk: Math.max(0, canBunk),
                status: currentPercentage >= entry.required ? 'safe' : 'danger'
            };
        }
        
        function getRecommendations(entry, stats) {
            const recommendations = [];
            
            if (stats.status === 'danger') {
                recommendations.push(`⚠️ You need to attend ${stats.classesNeeded} more classes to reach ${entry.required}%`);
                recommendations.push(`📉 Currently ${(entry.required - stats.currentPercentage).toFixed(1)}% below target`);
                recommendations.push(`🎯 Attend next ${stats.classesNeeded} classes without missing any`);
            } else {
                recommendations.push(`✅ You're above the required ${entry.required}% attendance!`);
                if (stats.canBunk > 0) {
                    recommendations.push(`🎉 You can bunk ${stats.canBunk} classes and still maintain ${entry.required}%`);
                    recommendations.push(`😎 Enjoy your freedom responsibly!`);
                } else {
                    recommendations.push(`⚡ You're right at the threshold - be careful!`);
                }
                recommendations.push(`🏆 Current: ${stats.currentPercentage.toFixed(1)}% - Keep it up!`);
            }
            
            if (stats.currentPercentage === 100) {
                recommendations.push(`🌟 Perfect attendance! You're unstoppable!`);
            }
            
            return recommendations;
        }
        
        function renderResult(entry) {
            const container = document.getElementById('resultContainer');
            const stats = calculateAttendance(entry);
            const recommendations = getRecommendations(entry, stats);
            
            let cardClass = '';
            if (stats.status === 'safe' && stats.canBunk > 0) {
                cardClass = '';
            } else if (stats.status === 'danger') {
                cardClass = 'danger';
            } else if (stats.currentPercentage < entry.required + 5) {
                cardClass = 'warning';
            }
            
            container.innerHTML = `
                <div class="result-card ${cardClass}">
                    <div class="attendance-stats">
                        <div class="stat-item">
                            <div class="stat-value">${entry.attended}</div>
                            <div class="stat-label">Attended</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${entry.total}</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.currentPercentage.toFixed(1)}%</div>
                            <div class="stat-label">Current</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${entry.required}%</div>
                            <div class="stat-label">Required</div>
                        </div>
                        ${stats.canBunk > 0 ? `
                        <div class="stat-item" style="background: linear-gradient(135deg, #c8e6c9, #a5d6a7);">
                            <div class="stat-value" style="color: #2e7d32;">${stats.canBunk}</div>
                            <div class="stat-label" style="color: #2e7d32;">Can Bunk</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, stats.currentPercentage)}%"></div>
                        <div class="progress-text">${stats.currentPercentage.toFixed(1)}%</div>
                    </div>
                    
                    <div class="recommendations">
                        <h3>💡 Smart Recommendations</h3>
                        ${recommendations.map(rec => `
                            <div class="recommendation-item">${rec}</div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Trigger progress bar animation
            setTimeout(() => {
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    const width = progressFill.style.width;
                    progressFill.style.width = '0%';
                    setTimeout(() => progressFill.style.width = width, 100);
                }
            }, 100);
        }
        
        // Initialize the app
        window.addEventListener('load', function() {
            loadTheme();
        });
        
        // Enhanced input interactions
        document.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            element.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        showResult();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        clearForm();
                        break;
                }
            }
        });
    