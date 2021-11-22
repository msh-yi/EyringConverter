var kB = 1.38064852E-23
var h = 6.62607004E-34
var R = 8.31446261815324
var kappa = 1.000 /* transmission coeff */
var log10 = Math.log(10);

/* get these values from er_maj */
var fwd_fn_dict = {
    "ee": er_ee,
    "er_maj": er_er_maj,
    "er_min": er_er_min,
    "krel": er_krel,
    "ddg_kcal": er_ddg_kcal,
    "ddg_kj": er_ddg_kj,
    "ddg_MM": er_ddg_mm,
}

/* get er from these values */
var rev_fn_dict = {
    "ee": ee_er,
    "er_maj": er_maj_er,
    "er_min": er_min_er,
    "krel": krel_er,
    "ddg_kcal": ddg_kcal_er,
    "ddg_kj": ddg_kj_er,
    "ddg_MM": ddg_mm_er,
}

var temp = 0.000
var er_maj = 0.000
var nchars = 0

/* calculate everything in terms of e.r. */

function update_temp(input_id) {

    try {
        var input_temp = document.getElementById(input_id).value

        if ((input_id == "temp_k" && input_temp <= 0) || (input_id == "temp_c" && input_temp <= -273.15)) {
            throw "Temperature should be > 0 Kelvins!"
        }
        if (isNaN(input_temp)) {
            throw "Input must be a number!"
        }
    }
    catch (err) {
        document.getElementById("err_msg").innerHTML = err
        document.getElementById("temp_k").value = 298.15
        document.getElementById("temp_c").value = 25.0
        update("er_maj")
        return
    }

    nchars = sigfigs(input_temp)

    if (input_id == "temp_c") {
        document.getElementById("temp_k").value = trunc(c_to_k(input_temp), nchars)
    }
    else if (input_id == "temp_k") {
        document.getElementById("temp_c").value = trunc(k_to_c(input_temp), nchars)

    }
    update("er_maj")
}

function update(input_id) {
    var input_value = document.getElementById(input_id).value
    nchars = sigfigs(input_value)
    if (nchars == 0) {
        nchars = 1
    }

    var elts = document.getElementById("form").elements
    /* initialize all input values */
    temp = document.getElementById("temp_k").value
    er_maj = rev_fn_dict[input_id](input_value) /* calculate er_maj first */
    /* compute each quantity */
    for (var i = 0; i < elts.length; i++) {
        if (elts.item(i).id != "temp_k" && elts.item(i).id != "temp_c") {
            elts.item(i).value = trunc(fwd_fn_dict[elts.item(i).id](er_maj), nchars)
        }
    }
}


function er_ee(er) {
    return er - (100.000 - er)
}

function er_er_maj(er) {
    return er
}

function er_er_min(er) {
    return 100.000 - er
}

function er_krel(er) {
    return er / (100.000 - er)
}

function er_ddg_kcal(er) {

    /* \Delta G ^{\ddag} = -RT \cdot \ln{\frac{k_{rel} h}{\kappa k_B T}} */
    return er_ddg_kj(er) / 4.184
}

function er_ddg_mm(er) {

    return er_ddg_kcal(er) / 5.0714
}

function er_ddg_kj(er) {
    var krel = er_krel(er)

    /* \Delta G ^{\ddag} = -RT \cdot \ln{\frac{k_{rel} h}{\kappa k_B T}} */
    var ddg_j = R * temp * Math.log(krel)

    return ddg_j / 1000
}

function ee_er(ee) {
    return 50 + (ee / 2.0)
}

function er_maj_er(er_maj) {
    return er_maj
}

function er_min_er(er_min) {
    return 100.00 - er_min
}

function krel_er(krel) {
    krel = parseFloat(krel)
    return (krel / (krel + 1.0)) * 100
}

function ddg_kcal_er(ddg_kcal) {
    ddg_j = ddg_kcal * 4184
    krel = Math.exp(ddg_j / R / temp)

    return krel_er(krel)
}

function ddg_kj_er(ddg_kj) {
    return ddg_kcal_er(ddg_kj / 4.184)
}

function ddg_mm_er(ddg_mm) {
    return ddg_kcal_er(ddg_mm * 5.0714) /* 28 pieces contains 142 calories */
}

function c_to_k(c) {
    return parseFloat(c) + 273.15
}

function k_to_c(k) {
    return parseFloat(k) - 273.15
}

function sigfigs(n) {
    n = Math.abs(String(n).replace(".", "")); //remove decimal and make positive
    if (n == 0) return 0;
    //while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n

    return Math.floor(Math.log(n) / log10) + 1; //get number of digits
}

// Significant figure functions
function ord(x) {
    return Math.floor(Math.log(Math.abs(x + 1e-35)) / 2.303)
}
// Truncate to n sign. figures
function trunc(x, n) {
    return Math.floor(x * Math.pow(10, -ord(x) + n - 1) + .5) / Math.pow(10, -ord(x) + n - 1)
}