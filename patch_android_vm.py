import re

file_path = "d:/Dev/projects/hwnix-cash/app/src/main/java/com/hwnix/cash/presentation/onboarding/OnboardingViewModel.kt"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import ServiceProviderInfo
if "ServiceProviderInfo" not in content:
    content = content.replace("import com.hwnix.cash.presentation.onboarding.OnboardingUiState",
                              "import com.hwnix.cash.presentation.onboarding.OnboardingUiState\nimport com.hwnix.cash.presentation.onboarding.ServiceProviderInfo")

# 2. Add fetchServiceProviders() and selectServiceProvider()
new_methods = """
    fun fetchServiceProviders() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingProviders = true) }
            try {
                val response = ApiClient.getService().getServiceProviders("wallet")
                if (response.isSuccessful) {
                    val dataObj = response.body()
                    val dataArr = dataObj?.getAsJsonArray("data")
                    val providers = mutableListOf<ServiceProviderInfo>()
                    dataArr?.forEach { element ->
                        val obj = element.asJsonObject
                        providers.add(
                            ServiceProviderInfo(
                                id = obj.get("id").asInt,
                                name = obj.get("name").asString
                            )
                        )
                    }
                    _uiState.update { it.copy(serviceProviders = providers, isLoadingProviders = false) }
                } else {
                    _uiState.update { it.copy(isLoadingProviders = false) }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _uiState.update { it.copy(isLoadingProviders = false) }
            }
        }
    }

    fun onProviderSelected(id: Int?) {
        _uiState.update { it.copy(selectedProviderId = id) }
    }

    fun onNextStep()"""

content = content.replace("    fun onNextStep()", new_methods)

# 3. Add to submit payload
submit_target = """                      state.monthlyDepositAlertValue.toDoubleOrNull()?.let { 
addProperty("monthly_deposit_alert_value", it) }
                      addProperty("monthly_deposit_alert_type", state.monthlyDepositAlertType)
                  }"""

new_submit = """                      state.monthlyDepositAlertValue.toDoubleOrNull()?.let { addProperty("monthly_deposit_alert_value", it) }
                      addProperty("monthly_deposit_alert_type", state.monthlyDepositAlertType)
                      
                      if (state.selectedProviderId != null) {
                          addProperty("create_provider_account", true)
                          addProperty("service_provider_id", state.selectedProviderId)
                      }
                  }"""
content = content.replace(submit_target, new_submit)

# Also need to replace the newlines correctly
content = re.sub(r"addProperty\(\"monthly_deposit_alert_value\", it\) \}\s*addProperty\(\"monthly_deposit_alert_type\", state.monthlyDepositAlertType\)\s*\}",
r"""addProperty("monthly_deposit_alert_value", it) }
                      addProperty("monthly_deposit_alert_type", state.monthlyDepositAlertType)
                      
                      if (state.selectedProviderId != null) {
                          addProperty("create_provider_account", true)
                          addProperty("service_provider_id", state.selectedProviderId)
                      }
                  }""", content)

# 4. Call fetchServiceProviders on init
init_target = """    init {
        checkSimLines()
    }"""
new_init = """    init {
        checkSimLines()
        fetchServiceProviders()
    }"""
content = content.replace(init_target, new_init)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched VM!")
