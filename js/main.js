function create_account(){
    var password_plain = document.getElementById('password').value;
    var confirm_password_plain = document.getElementById('confirm_password').value;
    var run_create = true;
    var error_message = "";
    var salt_characters = "0123456789abcdef";
    var password_salt = "";

    // Check for potential errors
    if(password_plain.length < 8){
        error_message += "Use a password that is at least 8 characters. ";
        run_create = false;
    }
    if(password_plain != confirm_password_plain){
        error_message += "Passwords do not match. ";
        run_create = false;
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
        localStorage.stronk_salt = password_salt;
        localStorage.stronk_password = password_hash;
        alert("Your password: " + password_plain + "\nhas been stored. DO NOT LOSE IT! ");
    }
}

function shred(){
    var confirm_shred = prompt('This is unrecoverable. If you are certain type: YES');
    if(confirm_shred == "YES"){
        localStorage.clear();
        if(!alert('NOTICE: Local storage ERASED!')){window.location.reload();}
    } else {
        alert('Shred aborted.');
    }
}
