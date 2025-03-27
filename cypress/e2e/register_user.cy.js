describe('API Test - Register a New User', () => {
    const user = {
        email: `testuser${Date.now()}@example.com`, // Ensure a unique email for each test
        password: 'SecurePassword123!',
        role: 'read' // Default role
    };

    const employee = {
        firstname: 'John',
        lastname: 'Doe',
        email: `johndoe${Date.now()}@example.com`
    };

    const updatedEmployee = {
        firstname: 'John Updated',
        lastname: 'Doe Updated',
        email: `updated${Date.now()}@example.com`
    };

    let accessToken;

    function responseBodyToJson(response){
        return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    }

    it('1st requirement: Should register a new user successfully and validate creation', () => {
        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: user
        }).then((response) => {
            expect(response.status).to.eq(201);
            let responseBody = responseBodyToJson(response);
            expect(responseBody).to.have.property('success', true);
            expect(responseBody).to.have.property('message', 'created');
        });
    });

    it('2st requirement: Should log in with the registered user and get an access token', () => {
        cy.request({
            method: 'POST',
            url: '/login',
            auth: {
                username: user.email,
                password: user.password
            }
        }).then((response) => {
            expect(response.status).to.eq(201);
            let responseBody = responseBodyToJson(response);
            expect(responseBody).to.have.property('token');
            accessToken = responseBody.token;
        });
    });

    it('2st requirement: Should fail to log in with a nonexistent user', () => {
        cy.request({
            method: 'POST',
            url: '/login',
            auth: {
                username: 'nonexistent@example.com',
                password: 'wrongpassword'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(201);
            let responseBody = responseBodyToJson(response);
            expect(responseBody).to.have.property('token', '');
        });
    });
});
