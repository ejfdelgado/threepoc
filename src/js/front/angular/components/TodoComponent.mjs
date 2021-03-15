export const TodoComponent = {
    bindings: {
      todoData: "<",
    },
    templateUrl: "/js/front/angular/components/TodoComponent.html",
    controller: class TodoComponent {
      constructor() {
        console.log("constructor");
      }
      $onInit() {
        console.log("TodoComponent onInit");
        this.newTodo = {
          title: "",
          selected: false,
        };
      }
      $onChanges(changes) {
        if (changes.todoData) {
          this.todos = Object.assign({}, this.todoData);
        }
      }
      addTodo({ todo }) {
        if (!todo) return;
        this.todos.unshift(todo);
        this.newTodo = {
          title: "",
          selected: false,
        };
      }
    },
  };