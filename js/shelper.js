function is_stored(variable_name){
    return (!(localStorage.getItem(variable_name) === null));
}
