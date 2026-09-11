// atan + data types play

#include <iostream>
#include <cmath>

int main() {

float target;
std::cin >> target;

float outputDef = atanf(target);

int outputInt = (int)outputDef;
char outputChar = (char)outputDef;
// outputFakeVecChar = 1l
// std::vector<char> outputFakeVecChar(1);
//(char)outputDef;

std::cout << outputDef << "\n";
std::cout << outputInt << "\n";
std::cout << outputChar << "\n";
// std::cout << outputFakeVecChar << "\n";

}