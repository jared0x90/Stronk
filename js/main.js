//localStorage.clear();

app_data = {
    "user": 0,
    "pass": 1,
    "public_key": 2
}
progress = [];
reset_progress = function(msg) {
    progress = [];
    return $("#progress-summary").html(msg || '');
};
create_account_progress_hook = function(p) {
    var h, pr, _i, _len;
    if (progress.length && (progress[progress.length - 1].what === p.what)) {
        progress[progress.length - 1] = p;
    } else {
        progress.push(p);
    }
    h = "Encrying user details<br><br>";
    for (_i = 0, _len = progress.length; _i < _len; _i++) {
        pr = progress[_i];
        h += "<li>" + pr.what + " " + pr.i + "/" + pr.total + "</li>";
    }
    return $("#create_account_progress_summary").html(h);
};


function create_account(){
    $("#create_account_progress_summary").html("Verifying details...");
    var user_plain = document.getElementById('user').value;
    var password_plain = document.getElementById('password').value;
    var confirm_password_plain = document.getElementById('confirm_password').value;
    var run_create = true;
    var error_message = "";
    var salt_characters = "0123456789abcdef";
    var password_salt = "";
    var encrypted_user = "";

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
        $("#create_account_progress_summary").html("Salting &amp; hashing password...");
        // Generate salt
        $("#button_create_account").attr("disabled", "disabled");
        $("#progress_bar_th").prepend('<img src="img/loadbar.gif">');
        // $("#button_create_account").hide(200);

        for(var salt_position = 1; salt_position < 64; salt_position++){
            password_salt += salt_characters.charAt(Math.floor(Math.random() * salt_characters.length));
        }

        // Generate password hash
        var password_hash = SHA256(password_salt + password_plain);
        var aes_key = buildAESKey(password_plain, password_salt);
        reset_progress();
        triplesec.encrypt ({
            data:          new triplesec.Buffer(user_filtered),
            key:           new triplesec.Buffer(aes_key),
            progress_hook: create_account_progress_hook
        }, function(err, buff) {
            if (! err) {
                // Copy password out of the buffer
                encrypted_user = buff.toString('hex');
                localStorage.stronk_salt = password_salt;
                localStorage.stronk_password = password_hash;
                localStorage.stronk_user = encrypted_user;
                if(!alert("Your password: " + password_plain + "\nhas been stored securely. DO NOT LOSE IT!\nIt is NOT recoverable.")){window.location.replace("index.html");};
            } else {
                alert("Error: " + err)
            }
        });
    }
}

function shred(){
    var confirm_shred = prompt('This is unrecoverable. If you are certain type: YES');
    if(confirm_shred == "YES"){
        localStorage.clear();
        if(!alert('NOTICE: Local storage ERASED!')){window.location.replace("index.html");}
    } else {
        alert('Shred aborted.');
    }
}

function buildAESKey(password_plain, salt){
    return SHA256(SHA256(password + salt) + password_plain);
}

function is_stored(variable_name){
    return (!(localStorage.getItem(variable_name) === null));
}

function process_login(){

}
