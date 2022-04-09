/**
 * Example Usage:
 *
 *    network(
 *      "query",
 *       `login(email: "test@test.com", password: "pass4test")`,
 *       `userId
 *        token
 *        tokenExpiration`,
 *       this.context.getToken()
 *    ).then((response) => {
 *      console.log(response.data.login.userId);
 *      console.log(response.data.login.token);
 *    }).catch((err) => {
 *      console.warn(err)
 *    });
 * 
 */

export default function network(type, endpoint, requestFields, token) {
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

  return new Promise((resolve, reject) => {
    fetch("/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? ("Bearer " + token) : ""
      },
    }).then((res) => {
      resolve(res.json());
    }).catch((err) => {
      reject(new Error(err));
    });
  }); 
}
