function create_account(){
    var user_plain = document.getElementById('user').value;
    var password_plain = document.getElementById('password').value;
    var confirm_password_plain = document.getElementById('confirm_password').value;
    var run_create = true;
    var error_message = "";
    var salt_characters = "0123456789abcdef";
    var password_salt = "";

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
        // Generate salt
        for(var salt_position = 1; salt_position < 64; salt_position++){
            password_salt += salt_characters.charAt(Math.floor(Math.random() * salt_characters.length));
        }

        // Generate password hash
        var password_hash = SHA256(password_salt + password_plain);
        var aes_key = buildAESKey(password_plain, password_salt);
        var encrypted_user = sjcl.hash.sha256(user_filtered);
        //localStorage.stronk_user = user_filtered;
        localStorage.stronk_salt = password_salt;
        localStorage.stronk_password = password_hash;
        alert(encrypted_user);



        if(!alert("Your password: " + password_plain + "\nhas been stored securely. DO NOT LOSE IT!\nIt is NOT recoverable.")){window.location.replace("index.html");};
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
