// Initialize variables
app_data = {
    "uid": 0,
    "user": 0,
    "pass": 0,
    "public_key": 0,
    "private_key": 0
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
    h = "Encrypting user details<br><br>";
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
        $("#create_account_progress_summary").html("Encrypting user details...");
        $("#button_create_account").attr("disabled", "disabled");
        $("#progress_bar_th").prepend('<img src="img/loadbar.gif">');
        app_data.user = user_filtered;
        app_data.pass = password_plain;


        // Generate password hash
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

function is_stored(variable_name){
    return (!(localStorage.getItem(variable_name) === null));
}

function process_login(){

}
