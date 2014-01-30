// jQuery's Document on ready callback...
// Let's get things a rollin....

// Initialize variables
RSA_STRENGTH = 2048;
app_data = {
    "uid": 0,
    "user": 0,
    "rsa_passphrase": 0,
    "rsa_fingerprint": 0
}
progress = [];

var isPhoneGap = function() {
    /*

    From  http://stackoverflow.com/questions/8068052/phonegap-detect-if-running-on-desktop-browser

    Useage:

    if ( isPhoneGap() ) {
        alert("Running on PhoneGap!");
    } else {
        alert("Not running on PhoneGap!");
    }

    */
    if (window.device) {
      // Running on PhoneGap
      return true;
    } else {
        return false;

    }
}


var reset_progress = function(msg) {
    progress = [];
    return $("#progress-summary").html(msg || '');
};

var create_account_progress_hook = function(p) {
    update_progress_hook(p, "create_account_progress_summary");
};

var login_account_progress_hook = function(p){
    update_progress_hook(p, "login_progress");
};

var update_progress_hook = function(p, element_id){
    var h, pr, _i, _len;
    if (progress.length && (progress[progress.length - 1].what === p.what)) {
        progress[progress.length - 1] = p;
    } else {
        progress.push(p);
    }
    h = "Processing user details<br><br>";
    for (_i = 0, _len = progress.length; _i < _len; _i++) {
        pr = progress[_i];
        h += "<li>" + pr.what + " " + pr.i + "/" + pr.total + "</li>";
    }
    return $("#" + element_id).html(h);
};

var create_account = function(){
    $("#create_account_progress_summary").html("Verifying details...");
    var user_plain = document.getElementById('user').value;
    var password_plain = document.getElementById('password').value;
    var confirm_password_plain = document.getElementById('confirm_password').value;
    var run_create = true;
    var error_message = "";

    // Filter username
    var user_filtered = user_plain;
    var user_filtered = user_filtered.trim();
    var user_filtered = user_filtered.replace(/[^0-9A-Za-z]/g, '');

    // Check for potential errors
    if(user_filtered != user_plain){
        run_create = false;
        error_message +="Username included invalid characters. Allowable characters are A-Z and 0-9. "
    }
    if(password_plain.length < 8){
        run_create = false;
        error_message += "Use a password that is at least 8 characters. ";
    }
    if(password_plain != confirm_password_plain){
        run_create = false;
        error_message += "Passwords do not match. ";
    }

    // If there was an error display it otherwise create the account
    if(!run_create){
        alert("Error: " + error_message);
    } else {
        // Create RSA key pair info
        $("#create_account_progress_summary").html("Generating RSA key pair.<br>This may take some time...");
        var new_rsa_key_base = create_rsa_basekey(password_plain);
        var new_rsa_key = cryptico.generateRSAKey(new_rsa_key_base, RSA_STRENGTH);
        app_data.rsa_passphrase = new_rsa_key_base;
        app_data.rsa_fingerprint = cryptico.publicKeyID(cryptico.publicKeyString(new_rsa_key));

        // Encrypt user details
        $("#create_account_progress_summary").html("Encrypting user details...");
        $("#button_create_account").attr("disabled", "disabled");
        $("#progress_bar_th").prepend('<img src="img/loadbar.gif">');
        app_data.user = user_filtered;

        reset_progress();
        triplesec.encrypt ({
            data:          new triplesec.Buffer(JSON.stringify(app_data)),
            key:           new triplesec.Buffer(password_plain),
            progress_hook: create_account_progress_hook
        }, function(err, buff) {
            if (! err) {
                // Copy password out of the buffer
                localStorage.app_data = buff.toString('hex');
                if(!alert("Your password: " + password_plain + "\nand user details have been\nstored securely. DO NOT LOSE!\nThey are NOT recoverable!")){window.location.replace("index.html");};
            } else {
                alert(err);
            }
        });
    }
};

var create_rsa_basekey = function (pass){
    var keyout = "";
    var hashbase = pass;
    for(j = 0; j < 8; j++){
        for(var i = 0; i < 256; i++){
            hashbase = cryptico.publicKeyID(hashbase + pass + random_string(16, 'aA#!'));
        }
        keyout = keyout + hashbase;
    }
    return keyout;
};

var shred = function(){
    var confirm_shred = prompt('This is unrecoverable. If you are certain type: YES');
    if(confirm_shred == "YES"){
        localStorage.clear();
        if(!alert('NOTICE: Local storage ERASED!')){window.location.replace("index.html");}
    } else {
        alert('Shred aborted.');
    }
};

var random_string = function (length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

var is_stored = function(variable_name){
    return (!(localStorage.getItem(variable_name) === null));
};

var process_login = function(){
    var password_plain = document.getElementById('password').value;
    var encrypted_app_data = localStorage.app_data;

    reset_progress();
    triplesec.decrypt ({
        data:          new triplesec.Buffer(encrypted_app_data, "hex"),
        key:           new triplesec.Buffer(password_plain),
        progress_hook: login_account_progress_hook
    }, function(err, buff) {
        if (! err) {
            app_data = JSON.parse(buff.toString());
            if(!alert("Your data:\n" + JSON.stringify(app_data) + "\nand user details have been\nloaded securely.")){window.location.replace("index.html");};
        } else {
            alert(err)
        }
    });
};
