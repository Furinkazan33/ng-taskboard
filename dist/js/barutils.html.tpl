<div id="bar" class="row">
  <form class="col s12">
    <div class="input-field col s2">
      <textarea class="materialize-textarea title" ng-model="task.title"></textarea>
      <label for="title">Title</label>
    </div>
    <div class="input-field col s3">
      <textarea class="materialize-textarea text" ng-model="task.text"></textarea>
      <label for="text">Content</label>
    </div>
    <button id="btn" class="btn col s1" type="button" ng-click="newTask(task.title, task.text)">New</button>
  </form>
</div>
