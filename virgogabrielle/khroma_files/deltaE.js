var formatDeltaE = function(rgb) {
  var lab = Khroma.convert('rgb', 'lab')(rgb);
  var arg = {
    L: lab[0],
    A: lab[1],
    B: lab[2]
  };
  return arg;
};

function dE00(x1, x2, weights) {
    var sqrt = Math.sqrt;
    var pow = Math.pow;

    this.x1 = x1;
    this.x2 = x2;

    this.weights = weights || {};
    this.ksubL = this.weights.lightness || 1;
    this.ksubC = this.weights.chroma || 1;
    this.ksubH = this.weights.hue || 1;

    // Delta L Prime
    this.deltaLPrime = x2.L - x1.L;

    // L Bar
    this.LBar = (x1.L + x2.L) / 2;

    // C1 & C2
    this.C1 = sqrt(pow(x1.A, 2) + pow(x1.B, 2));
    this.C2 = sqrt(pow(x2.A, 2) + pow(x2.B, 2));

    // C Bar
    this.CBar = (this.C1 + this.C2) / 2;

    // A Prime 1
    this.aPrime1 = x1.A +
        (x1.A / 2) *
        (1 - sqrt(
            pow(this.CBar, 7) /
            (pow(this.CBar, 7) + pow(25, 7))
        ));

    // A Prime 2
    this.aPrime2 = x2.A +
        (x2.A / 2) *
        (1 - sqrt(
            pow(this.CBar, 7) /
            (pow(this.CBar, 7) + pow(25, 7))
        ));

    // C Prime 1
    this.CPrime1 = sqrt(
        pow(this.aPrime1, 2) +
        pow(x1.B, 2)
    );

    // C Prime 2
    this.CPrime2 = sqrt(
        pow(this.aPrime2, 2) +
        pow(x2.B, 2)
    );

    // C Bar Prime
    this.CBarPrime = (this.CPrime1 + this.CPrime2) / 2;

    // Delta C Prime
    this.deltaCPrime = this.CPrime2 - this.CPrime1;

    // S sub L
    this.SsubL = 1 + (
        (0.015 * pow(this.LBar - 50, 2)) /
        sqrt(20 + pow(this.LBar - 50, 2))
    );

    // S sub C
    this.SsubC = 1 + 0.045 * this.CBarPrime;

    /**
     * Properties set in getDeltaE method, for access to convenience functions
     */
    // h Prime 1
    this.hPrime1 = 0;

    // h Prime 2
    this.hPrime2 = 0;

    // Delta h Prime
    this.deltahPrime = 0;

    // Delta H Prime
    this.deltaHPrime = 0;

    // H Bar Prime
    this.HBarPrime = 0;

    // T
    this.T = 0;

    // S sub H
    this.SsubH = 0;

    // R sub T
    this.RsubT = 0;
}

dE00.prototype.getDeltaE = function() {
    var sqrt = Math.sqrt;
    var sin = Math.sin;
    var pow = Math.pow;

    // h Prime 1
    this.hPrime1 = this.gethPrime1();

    // h Prime 2
    this.hPrime2 = this.gethPrime2();

    // Delta h Prime
    this.deltahPrime = this.getDeltahPrime();

    // Delta H Prime
    this.deltaHPrime = 2 * sqrt(this.CPrime1 * this.CPrime2) * sin(this.degreesToRadians(this.deltahPrime) / 2);

    // H Bar Prime
    this.HBarPrime = this.getHBarPrime();

    // T
    this.T = this.getT();

    // S sub H
    this.SsubH = 1 + 0.015 * this.CBarPrime * this.T;

    // R sub T
    this.RsubT = this.getRsubT();

    // Put it all together!
    var lightness = this.deltaLPrime / (this.ksubL * this.SsubL);
    var chroma = this.deltaCPrime / (this.ksubC * this.SsubC);
    var hue = this.deltaHPrime / (this.ksubH * this.SsubH);

    return sqrt(
        pow(lightness, 2) +
        pow(chroma, 2) +
        pow(hue, 2) +
        this.RsubT * chroma * hue
    );
};

dE00.prototype.getRsubT = function() {
    var sin = Math.sin;
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    var exp = Math.exp;

    return -2 *
        sqrt(
            pow(this.CBarPrime, 7) /
            (pow(this.CBarPrime, 7) + pow(25, 7))
        ) *
        sin(this.degreesToRadians(
            60 *
            exp(
                -(
                    pow(
                        (this.HBarPrime - 275) / 25, 2
                    )
                )
            )
        ));
};

dE00.prototype.getT = function() {
    var cos = Math.cos;

    return 1 -
        0.17 * cos(this.degreesToRadians(this.HBarPrime - 30)) +
        0.24 * cos(this.degreesToRadians(2 * this.HBarPrime)) +
        0.32 * cos(this.degreesToRadians(3 * this.HBarPrime + 6)) -
        0.20 * cos(this.degreesToRadians(4 * this.HBarPrime - 63));
};

dE00.prototype.getHBarPrime= function() {
    var abs = Math.abs;

    if (abs(this.hPrime1 - this.hPrime2) > 180) {
        return (this.hPrime1 + this.hPrime2 + 360) / 2
    }

    return (this.hPrime1 + this.hPrime2) / 2
};

dE00.prototype.getDeltahPrime = function() {
    var abs = Math.abs;

    // When either C′1 or C′2 is zero, then Δh′ is irrelevant and may be set to
    // zero.
    if (0 === this.C1 || 0 === this.C2) {
        return 0;
    }

    if (abs(this.hPrime1 - this.hPrime2) <= 180) {
        return this.hPrime2 - this.hPrime1;
    }

    if (this.hPrime2 <= this.hPrime1) {
        return this.hPrime2 - this.hPrime1 + 360;
    } else {
        return this.hPrime2 - this.hPrime1 - 360;
    }
};

dE00.prototype.gethPrime1 = function() {
    return this._gethPrimeFn(this.x1.B, this.aPrime1);
};

dE00.prototype.gethPrime2 = function() {
    return this._gethPrimeFn(this.x2.B, this.aPrime2);
};

dE00.prototype._gethPrimeFn = function(x, y) {
    var hueAngle;

    if (x === 0 && y === 0) {
        return 0;
    }

    hueAngle = this.radiansToDegrees(Math.atan2(x, y));

    if (hueAngle >= 0) {
        return hueAngle;
    } else {
        return hueAngle + 360;
    }
};

dE00.prototype.radiansToDegrees = function(radians) {
    return radians * (180 / Math.PI);
};

dE00.prototype.degreesToRadians = function(degrees) {
    return degrees * (Math.PI / 180);
};
