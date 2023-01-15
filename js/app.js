function iniciarApp(){

    const resultado = document.querySelector('#resultado');

    const selectCategorias = document.querySelector('#categorias');
    //change evento para un select
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){
        obtenerFavoritos();
    }

    //le paso la opcion de como crearlo, sera objeto vacio
    const modal = new bootstrap.Modal('#modal', {});

    

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
        .then(respuesta => {
            return respuesta.json()
        })
        .then(resultado =>{
            mostrarCategorias(resultado.categories)
        })
    }
//le indico que estas categorias deben ser un arreglo
    function mostrarCategorias(categorias = []){
        //itero en cada categorias
        categorias.forEach(categoria =>{
            const option = document.createElement('option');
            //selecciono el valor de option que se leera para enviar una peticion a la api
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option);
            
        })
        
    }
    
    function seleccionarCategoria(e){
        //para leer el contenido de lo que está disparando el evento
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []){

        limpiarHTML(resultado);

        
        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        //const selectCategorias = document.querySelector('#categorias');
        
        const mainPage = 'index.html';
        if(location.pathname.endsWith(mainPage)){
            
            const selectedCategory = document.querySelector('#categorias').value;
            heading.textContent = recetas.length ? `Results from ${selectedCategory}` : 'There are no results';
        } else{
            heading.textContent = recetas.length ? `Results` : 'There are no results'
        }
       // heading.textContent = recetas.length ? `Resultados de ` : 'No hay resultados'
        resultado.appendChild(heading);

        //iterar en los resultados
        recetas.forEach(receta => {

            const {idMeal, strMeal, strMealThumb} = receta
            //div contenedor
            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4');
            //card contenedora
            const recetaCard = document.createElement('div');
            recetaCard.classList.add('card', 'mb-4');
            //imagen de la receta
            const recetaImagen = document.createElement('img');
            recetaImagen.classList.add('card-img-top');
            //texto alternativo de la imagen
            recetaImagen.alt = `Recipe image ${strMeal ?? receta.title}`;
            recetaImagen.src = strMealThumb ?? receta.img;

            //div para almacenar el resto de info 
            const recetaCardBody = document.createElement('div');
            recetaCardBody.classList.add('card-body');
            //encabezado con el nombre de la comida strmeal
            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.title;
            //boton para clicar en ver receta
            const recetaBtn = document.createElement('button');
            recetaBtn.classList.add('btn', 'btn-dark', 'w-100');
            recetaBtn.textContent = 'See recipe';
            //recetaBtn.dataset.bsTarget = "#modal";
            //recetaBtn.dataset.bsToggle = "modal";
            //no es eventlistener no sirve porque donde clicamos
            //se generará solo cuando el codigo js se ejecute
            //no cuando la pag cargue, no existe en el html
            //function previene que se ejecute la function seleccionarReceta
            //hasta que ocurra el evento onclick
            recetaBtn.onclick = function(){
                seleccionarReceta(idMeal ?? receta.id);
            }

            //imprimir en el html
            //primero le añado los elementos al cardbody
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaBtn);
            //esos mismos y la imagen en el card
            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);
            //y el card al contenedor
            recetaContenedor.appendChild(recetaCard);
            //y todo eso lo añado al id resultado del html
            resultado.appendChild(recetaContenedor);

           

            
        })
    }

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta){


        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;

        //añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipe of ${strMeal}"/>
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredients and quantities</h3>
        `;
        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group');
        //mostrar cantidades e ingredientes
        for(let i= 1; i<= 20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('li');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                
                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        //botones de cerrar y favorito
        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn', 'btn-dark', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Remove from favourites' : 'Add to favourites'

        //localstorage
        btnFavorito.onclick = function(){
            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Add to favourites';
                mostrarToast('Removed from favourites');
                return
            }
            agregarFavorito({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = 'Remove from favourites';
            mostrarToast('Recipe added');
        }

        const btnCerrarModal = document.createElement('button');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Close';
        btnCerrarModal.onclick = function(){
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        //mostrar el modal
        modal.show();
    }

    function agregarFavorito(receta){
        //para convertir favoritos en arreglo con json.parse
        //sino existe ?? agrega un arreglo
        //localstorage solo almacena strings, lo convierto en arreglo, agrego nueva receta
        //y lo vuelvo a convertir en string
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
        if (favoritosDiv) { 
            
            const nuevosFavoritos = JSON.parse(localStorage.getItem('favoritos'));
            
            limpiarHTML(resultado);
            mostrarRecetas(nuevosFavoritos);
 
        }
    }
    
    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
        if (favoritosDiv) { 
            
            limpiarHTML(resultado);
            mostrarRecetas(nuevosFavoritos);
 
        }
        
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show()
    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarRecetas(favoritos);
            return
        }

        const noFavoritos = document.createElement('p');
        noFavoritos.textContent = 'There are no favourites yet';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(noFavoritos);
    }

    function limpiarHTML(parametro){
        while(parametro.firstChild){
            parametro.removeChild(parametro.firstChild);
        }
    }
}



//iniciar cuando cargue el documento
document.addEventListener('DOMContentLoaded', iniciarApp)