function isValidVPA(vpa) {
  return /^[\w.-]+@[\w.-]+$/.test(vpa);
}

function luhnCheck(num) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function cardNetwork(num) {
  if (num.startsWith("4")) return "visa";
  if (num.startsWith("5")) return "mastercard";
  return "unknown";
}

function isExpired(m, y) {
  const now = new Date();
  return new Date(y, m - 1) < now;
}

module.exports = { isValidVPA, luhnCheck, cardNetwork, isExpired };
