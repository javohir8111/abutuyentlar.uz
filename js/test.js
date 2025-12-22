// Test navigation and logic
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('psychologyTestForm');
    if (!form) return;

    const sections = document.querySelectorAll('.question-section');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let currentSection = 0;
    const totalQuestions = 10; // Total number of questions
    let answeredQuestions = 0;

    // Show current section
    function showSection(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });

        // Update button visibility
        prevBtn.style.display = index === 0 ? 'none' : 'block';
        nextBtn.style.display = index === sections.length - 1 ? 'none' : 'block';
        submitBtn.style.display = index === sections.length - 1 ? 'block' : 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Count answered questions
    function updateProgress() {
        answeredQuestions = 0;
        const allQuestions = form.querySelectorAll('input[type="radio"]');
        const questionNames = new Set();
        
        allQuestions.forEach(input => {
            questionNames.add(input.name);
        });

        questionNames.forEach(name => {
            if (form.querySelector(`input[name="${name}"]:checked`)) {
                answeredQuestions++;
            }
        });

        const percentage = (answeredQuestions / totalQuestions) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${answeredQuestions}/${totalQuestions} savol`;
    }

    // Check if current section is complete
    function isSectionComplete() {
        const currentSectionElement = sections[currentSection];
        const questions = currentSectionElement.querySelectorAll('input[type="radio"]');
        const questionNames = new Set();
        
        questions.forEach(input => {
            questionNames.add(input.name);
        });

        for (let name of questionNames) {
            if (!form.querySelector(`input[name="${name}"]:checked`)) {
                return false;
            }
        }
        return true;
    }

    // Next button
    nextBtn.addEventListener('click', function() {
        if (!isSectionComplete()) {
            alert('Iltimos, barcha savollarga javob bering!');
            return;
        }

        if (currentSection < sections.length - 1) {
            currentSection++;
            showSection(currentSection);
            updateProgress();
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        if (currentSection > 0) {
            currentSection--;
            showSection(currentSection);
        }
    });

    // Update progress on radio change
    form.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            updateProgress();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (answeredQuestions < totalQuestions) {
            alert('Iltimos, barcha savollarga javob bering!');
            return;
        }

        // Collect answers
        const answers = {};
        for (let i = 1; i <= totalQuestions; i++) {
            const answer = form.querySelector(`input[name="q${i}"]:checked`);
            if (answer) {
                answers[`q${i}`] = answer.value;
            }
        }

        // Calculate results (simplified)
        const results = analyzeAnswers(answers);

        // Save results
        localStorage.setItem('testResults', JSON.stringify(results));
        localStorage.setItem('testAnswers', JSON.stringify(answers));

        // Show success message
        alert('Test muvaffaqiyatli yakunlandi! Natijalaringizni ko\'rish uchun dashboard ga o\'tilmoqda...');
        
        // Redirect to results or dashboard
        window.location.href = 'recommendations.html';
    });

    // Analyze answers and determine personality/interests
    function analyzeAnswers(answers) {
        const categories = {
            tech: 0,
            science: 0,
            bio: 0,
            humanities: 0,
            arts: 0,
            business: 0
        };

        // Simple scoring based on answers
        Object.values(answers).forEach(answer => {
            if (answer === 'tech' || answer === 'it') categories.tech += 2;
            if (answer === 'science' || answer === 'engineer') categories.science += 2;
            if (answer === 'bio' || answer === 'doctor') categories.bio += 2;
            if (answer === 'humanities') categories.humanities += 2;
            if (answer === 'arts' || answer === 'creative') categories.arts += 2;
            if (answer === 'business') categories.business += 2;
            
            // Personality traits
            if (answer === 'team') categories.business += 1;
            if (answer === 'solo') categories.tech += 1;
            if (answer === 'analytical' || answer === 'logical') {
                categories.tech += 1;
                categories.science += 1;
            }
            if (answer === 'creative') categories.arts += 1;
        });

        // Find top 3 categories
        const sorted = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const recommendations = {
            top_category: sorted[0][0],
            categories: sorted,
            personality: determinePersonality(answers),
            recommended_fields: getRecommendedFields(sorted[0][0]),
            recommended_universities: getRecommendedUniversities(sorted[0][0])
        };

        return recommendations;
    }

    function determinePersonality(answers) {
        const traits = [];
        
        if (answers.q4 === 'team') traits.push('Jamoaviy');
        if (answers.q4 === 'solo') traits.push('Mustaqil');
        
        if (answers.q5 === 'analytical') traits.push('Analitik');
        if (answers.q5 === 'creative') traits.push('Ijodiy');
        if (answers.q5 === 'practical') traits.push('Amaliy');
        
        if (answers.q6 === 'logical') traits.push('Mantiqiy');
        if (answers.q6 === 'creative') traits.push('Ijodkor');
        if (answers.q6 === 'social') traits.push('Kommunikativ');
        
        return traits;
    }

    function getRecommendedFields(category) {
        const fields = {
            tech: [
                'Dasturiy ta\'minot injiniringi',
                'Kompyuter ilmlari',
                'Sun\'iy intellekt',
                'Kiberbezopaslik',
                'Web dasturlash'
            ],
            science: [
                'Fizika',
                'Matematika',
                'Muhandislik',
                'Arxitektura',
                'Energetika'
            ],
            bio: [
                'Tibbiyot',
                'Farmatsiya',
                'Biologiya',
                'Biotexnologiya',
                'Veterinariya'
            ],
            humanities: [
                'Til va adabiyot',
                'Tarix',
                'Falsafa',
                'Psixologiya',
                'Jurnalistika'
            ],
            arts: [
                'Dizayn',
                'San\'at',
                'Arxitektura',
                'Kino va televideniye',
                'Musiqa'
            ],
            business: [
                'Biznes boshqaruv',
                'Iqtisodiyot',
                'Marketing',
                'Moliya',
                'Menejment'
            ]
        };
        
        return fields[category] || fields.tech;
    }

    function getRecommendedUniversities(category) {
        const universities = {
            tech: [
                { name: 'TATU', match: 95 },
                { name: 'INHA', match: 90 },
                { name: 'WIUT', match: 88 },
                { name: 'TEAM University', match: 85 }
            ],
            science: [
                { name: 'O\'zMU', match: 92 },
                { name: 'Politexnika', match: 90 },
                { name: 'TATU', match: 85 },
                { name: 'INHA', match: 83 }
            ],
            bio: [
                { name: 'TTA', match: 95 },
                { name: 'Tibbiyot Akademiyasi', match: 93 },
                { name: 'Farmatsiya instituti', match: 88 }
            ],
            humanities: [
                { name: 'O\'zMU', match: 92 },
                { name: 'O\'zDJTU', match: 88 },
                { name: 'WIUT', match: 85 }
            ],
            arts: [
                { name: 'San\'at instituti', match: 95 },
                { name: 'Teatr va kino instituti', match: 90 },
                { name: 'Dizayn akademiyasi', match: 88 }
            ],
            business: [
                { name: 'WIUT', match: 95 },
                { name: 'TEAM University', match: 92 },
                { name: 'Iqtisodiyot universiteti', match: 90 },
                { name: 'INHA', match: 85 }
            ]
        };
        
        return universities[category] || universities.tech;
    }

    // Initialize
    showSection(0);
    updateProgress();
});

// Test timer (optional)
let testStartTime = Date.now();

window.addEventListener('beforeunload', function(e) {
    const testForm = document.getElementById('psychologyTestForm');
    if (testForm && !testForm.dataset.submitted) {
        e.preventDefault();
        e.returnValue = 'Test hali yakunlanmagan. Chindan ham chiqmoqchimisiz?';
    }
});

// Save progress periodically
setInterval(function() {
    const form = document.getElementById('psychologyTestForm');
    if (!form) return;

    const answers = {};
    const radios = form.querySelectorAll('input[type="radio"]:checked');
    
    radios.forEach(radio => {
        answers[radio.name] = radio.value;
    });

    if (Object.keys(answers).length > 0) {
        localStorage.setItem('testProgress', JSON.stringify(answers));
    }
}, 30000); // Save every 30 seconds

// Restore progress on load
window.addEventListener('load', function() {
    const form = document.getElementById('psychologyTestForm');
    if (!form) return;

    const savedProgress = localStorage.getItem('testProgress');
    if (savedProgress) {
        const answers = JSON.parse(savedProgress);
        
        Object.entries(answers).forEach(([name, value]) => {
            const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        });

        // Update progress bar
        const event = new Event('change', { bubbles: true });
        form.dispatchEvent(event);
    }
});

console.log('Test.js loaded successfully! 📝');