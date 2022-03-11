/**
 * Example Usage:
 *
 *    network(
 *      "query",
 *       `login(email: "test@test.com", password: "pass4test")`,
 *       `userId
 *        token
 *        tokenExpiration`
 *    ).then((response) => {
 *      console.log(response.data.login.userId);
 *      console.log(response.data.login.token);
 *    }).catch((err) => {
 *      console.warn(err)
 *    });
 * 
 */

export default function network(type, endpoint, requestFields) {
  if (["query", "mutation"].indexOf(type) === -1) return new Error("Invalid operation type");

  const requestBody = {
    query: `
      ${type} {
        ${endpoint} {
          ${requestFields}
        }
      }
    `,
  };

  return fetch("http://localhost:8000/api", {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    return res.json();
  });
}
