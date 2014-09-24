/** @jsx React.DOM */

define('modal', ['react'], function(React) {

    var Modal = React.createClass({
        getDefaultProps: function () {
            return {
                "title": "Modal Title",
                "content": "Content goes here..",
                "cancelButtonText": "Cancel",
                "onClickCancel": function () {},
                "showSubmitButton": true,
                "submitButtonText": "Save",
                "submitButtonClass": "btn-primary",
                "onClickSubmit": function () {}
            };
        },

        componentDidMount: function () {
            $(this.getDOMNode()).modal({
                "show": true
            });
        },

        render: function() {
            var submitButtonNode;
            if (this.props.showSubmitButton) {
                submitButtonNode = (
                    <button type="button" className={"btn " + this.props.submitButtonClass} data-dismiss="modal" onClick={this.props.onClickSubmit}>{this.props.submitButtonText}</button>
                );
            }

            return (
                <div className="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                <h4 className="modal-title" id="modal-label">{this.props.title}</h4>
                            </div>
                            <div className="modal-body" dangerouslySetInnerHTML={{__html: this.props.content}}>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.props.onClickCancel}>{this.props.cancelButtonText}</button>
                                {submitButtonNode}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    return Modal;
});
