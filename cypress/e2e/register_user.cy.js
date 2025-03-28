describe('API Test - Register a New User', () => {
    const user = {
        email: `testuser${Date.now()}@example.com`, // Ensure a unique email for each test
        password: 'SecurePassword123!',
        role: 'write' // Default role
    };

    const adminUser = {
        firstname: 'John',
        lastname: 'Doe',
        email: `johndoe${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        role: 'admin'
    };

    const employee = {
        firstname: 'John',
        lastname: 'Doe',
        email: `updated${Date.now()}@example.com`
    };

    const updatedEmployee = {
        firstname: 'John Updated',
        lastname: 'Doe Updated',
        email: `updated${Date.now()}@example.com`
    };

    let accessToken;

    function responseBodyToJson(response) {
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

    it('3st requirement: Should retrieve the updated employee', () => {

        // 1st step: register an admin user
        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: adminUser
        }).then((response) => {
            // 2nd step: login with the admin
            cy.request({
                method: 'POST',
                url: '/login',
                auth: {
                    username: adminUser.email,
                    password: adminUser.password
                }
            }).then((response) => {
                let responseBody = responseBodyToJson(response);
                //expect(responseBody).to.have.property('token');
                accessToken = responseBody.token;

                // 3rd step: create a new user
                cy.request({
                    method: 'POST',
                    url: '/employees',
                    headers: {
                        accessToken: accessToken
                    },
                    form: true,
                    body: employee,
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    const userId = responseBodyToJson(response).message.split('=')[1];
                    updatedEmployee.id = userId;

                    // 4rd step: update the date of the added user
                    cy.request({
                        method: 'PUT',
                        url: `/employees`,
                        headers: { accessToken },
                        form: true,
                        body: updatedEmployee,
                    }).then((response) => {
                        expect(response.status).to.eq(201);

                        // 5rd step: get the data of the updated user and assert if the data is correct
                        cy.request({
                            method: 'GET',
                            url: `/employees/${updatedEmployee.id}`,
                            headers: { accessToken },
                            form: true
                        }).then((response) => {
                            expect(response.status).to.eq(200);

                            const responseBody = JSON.parse(response.body);

                            expect(responseBody).to.have.property('first_name');
                            expect(responseBody).to.have.property('last_name');
                            expect(responseBody).to.have.property('email');

                            expect(responseBody.first_name).to.eq(updatedEmployee.firstname);
                            expect(responseBody.last_name).to.eq(updatedEmployee.lastname);
                            expect(responseBody.email).to.eq(updatedEmployee.email);
                        })
                    })
                })
            });
        });
    });
});
