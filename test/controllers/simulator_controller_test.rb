require 'test_helper'

class SimulatorControllerTest < ActionController::TestCase
  test "should get simulation" do
    get :simulation
    assert_response :success
  end

end
